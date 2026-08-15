import { AddonError, AddonResponseError } from '../errors.js';
import {
  addonSupports,
  parseAddonManifest,
  type AddonContentType,
  type AddonManifest,
  type AddonResource,
} from '../manifest.js';
import {
  AddonSourceSchema,
  BookMetaPreviewSchema,
  CatalogEnvelopeSchema,
  MetaResponseSchema,
  SourcesEnvelopeSchema,
  collectValid,
  type CatalogResponse,
  type MetaResponse,
  type SourcesResponse,
} from '../resources.js';
import {
  ambientFetch,
  type AddonExtra,
  type AddonTransport,
  type FetchLike,
} from '../transport.js';
import { memoryStorage, runCapability, type AddonStorage } from './capabilities.js';
import { assertIntegrity } from './integrity.js';
import {
  readSandboxMessage,
  SANDBOX_PROTOCOL_VERSION,
  type HostMessage,
  type SandboxMethod,
} from './protocol.js';
import { composeWorkerSource } from './worker-shim.js';

/**
 * An addon whose code runs on the reader's device, four layers away from everything that matters.
 *
 * ```
 * this page                        cookies, session, the API — none of it reachable below
 *  └─ <iframe sandbox="allow-scripts">        L1  opaque origin: storage and cookies throw
 *      └─ /addon-sandbox.html + CSP           L2  connect-src 'none' — no socket of its own
 *          └─ Worker(blob:)                   L3  no DOM, no document, no parent
 *              └─ the addon                   L4  talks only in structured-clone messages
 * ```
 *
 * Each layer removes something specific, and none of them is the whole answer. L1 is what makes the
 * rest meaningful — without an opaque origin a worker could simply `fetch` this instance's API with
 * the reader's cookies attached. L2 is why `mediatedFetch` cannot be bypassed rather than merely
 * being the polite route. L3 is why an addon cannot read the page it is rendered into. L4 is why
 * nothing with an identity — a function, a port, a live object — crosses in either direction.
 *
 * What this does not defend against is the addon doing exactly what the reader allowed: an addon
 * granted a host can send that host whatever it learns. The install screen has to say so, because
 * no amount of sandboxing says it for us.
 */

const DEFAULT_BOOT_TIMEOUT_MS = 10_000;
const DEFAULT_CALL_TIMEOUT_MS = 15_000;
const DEFAULT_FETCH_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_CHARS = 4 * 1024 * 1024;

export interface SandboxOptions {
  /** Where the sandbox document is served from. Same-origin path, e.g. `/addon-sandbox.html`. */
  readonly sandboxUrl: string;
  readonly container?: HTMLElement;
  readonly fetchImpl?: FetchLike;
  readonly storage?: AddonStorage;
  readonly parseXml?: (text: string) => unknown;
  readonly onLog?: (level: string, message: string) => void;
  readonly bootTimeoutMs?: number;
  readonly callTimeoutMs?: number;
  readonly fetchTimeoutMs?: number;
  readonly maxChars?: number;
}

/** The options once every default has been filled in — what the running addon actually uses. */
interface SandboxRuntime {
  readonly fetchImpl: FetchLike;
  readonly storage: AddonStorage;
  readonly parseXml: (text: string) => unknown;
  readonly onLog: (level: string, message: string) => void;
  readonly callTimeoutMs: number;
  readonly fetchTimeoutMs: number;
  readonly maxChars: number;
}

export class SandboxedAddon implements AddonTransport {
  private readonly pending = new Map<
    string,
    {
      resolve: (value: unknown) => void;
      reject: (error: Error) => void;
      timer: ReturnType<typeof setTimeout>;
    }
  >();
  private sequence = 0;
  private destroyed = false;

  private constructor(
    readonly manifest: AddonManifest,
    private readonly frame: HTMLIFrameElement,
    private readonly onMessage: (event: MessageEvent) => void,
    private readonly options: SandboxRuntime,
  ) {}

  async getCatalog(
    type: AddonContentType,
    catalogId: string,
    extra?: AddonExtra,
  ): Promise<CatalogResponse> {
    const raw = await this.invoke('getCatalog', 'catalog', type, catalogId, [
      type,
      catalogId,
      extra ?? {},
    ]);
    const envelope = CatalogEnvelopeSchema.safeParse(raw);
    if (!envelope.success) throw this.malformed('catalog');
    const { kept, dropped } = collectValid(BookMetaPreviewSchema, envelope.data.metas);
    return { metas: kept, dropped };
  }

  async getMeta(type: AddonContentType, id: string): Promise<MetaResponse> {
    const raw = await this.invoke('getMeta', 'meta', type, id, [type, id]);
    const parsed = MetaResponseSchema.safeParse(raw);
    if (!parsed.success) throw this.malformed('meta');
    return parsed.data;
  }

  async getSources(type: AddonContentType, id: string): Promise<SourcesResponse> {
    const raw = await this.invoke('getSources', 'source', type, id, [type, id]);
    const envelope = SourcesEnvelopeSchema.safeParse(raw);
    if (!envelope.success) throw this.malformed('source');
    const { kept, dropped } = collectValid(AddonSourceSchema, envelope.data.sources);
    return { sources: kept, dropped };
  }

  /**
   * Takes the addon down and takes its frame with it.
   *
   * Removing the iframe is what actually stops a runaway addon: a worker spinning in a loop ignores
   * every message, including one asking it to stop, so there is nothing to ask. This is also why the
   * call timeout below rejects rather than waiting — the page must not be hostage to a `while (true)`
   * somebody else wrote.
   */
  destroy(reason = 'This addon was stopped.'): void {
    if (this.destroyed) return;
    this.destroyed = true;
    globalThis.removeEventListener('message', this.onMessage);
    for (const [, waiting] of this.pending) {
      clearTimeout(waiting.timer);
      waiting.reject(new AddonError(reason));
    }
    this.pending.clear();
    this.frame.remove();
  }

  private malformed(resource: AddonResource): AddonResponseError {
    return new AddonResponseError(
      `${this.manifest.name} answered a ${resource} request in a shape this engine cannot read.`,
      this.manifest.id,
    );
  }

  private async invoke(
    method: SandboxMethod,
    resource: AddonResource,
    type: AddonContentType,
    id: string,
    args: readonly unknown[],
  ): Promise<unknown> {
    if (this.destroyed) throw new AddonError(`${this.manifest.name} is no longer running.`);
    if (!addonSupports(this.manifest, resource, type, id)) {
      throw new AddonResponseError(
        `${this.manifest.name} does not offer ${resource} for ${type}.`,
        this.manifest.id,
      );
    }
    this.sequence += 1;
    const callId = `h${this.sequence}`;
    return new Promise<unknown>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(callId);
        reject(new AddonError(`${this.manifest.name} did not answer in time.`));
      }, this.options.callTimeoutMs);
      this.pending.set(callId, { resolve, reject, timer });
      this.post({ v: SANDBOX_PROTOCOL_VERSION, type: 'invoke', callId, method, args });
    });
  }

  private post(message: HostMessage): void {
    // `'*'` rather than an origin because the target has none: a frame sandboxed without
    // `allow-same-origin` is on an opaque origin, and there is no string that names it. What makes
    // this safe is not the origin check but the handle — `contentWindow` is the frame we created and
    // still hold, and the addon lives in a worker with no way to navigate it elsewhere.
    this.frame.contentWindow?.postMessage(message, '*');
  }

  /** Wires a frame that has already said `booted` and whose addon has already said `ready`. */
  static adopt(
    manifest: AddonManifest,
    frame: HTMLIFrameElement,
    onMessage: (event: MessageEvent) => void,
    options: SandboxRuntime,
  ): SandboxedAddon {
    return new SandboxedAddon(manifest, frame, onMessage, options);
  }

  /** @internal — the message pump calls this; it is not part of the transport surface. */
  settle(callId: string, ok: boolean, payload: unknown): void {
    const waiting = this.pending.get(callId);
    if (!waiting) return;
    clearTimeout(waiting.timer);
    this.pending.delete(callId);
    if (ok) waiting.resolve(payload);
    else waiting.reject(new AddonError(String(payload)));
  }
}

/**
 * Downloads a bundle, checks it against the hash the reader approved, and starts it.
 *
 * The order matters and is the whole of the integrity guarantee: fetched, hashed, compared, and only
 * then composed with the shim and handed to a worker. There is no path here that runs unverified
 * code, and `assertIntegrity` throws rather than warning.
 */
export async function startLocalAddon(
  bundleSource: string,
  integrity: string,
  options: SandboxOptions,
): Promise<SandboxedAddon> {
  await assertIntegrity(bundleSource, integrity);

  const container = options.container ?? document.body;
  const frame = document.createElement('iframe');
  // No `allow-same-origin`: that single omission is what puts the frame on an opaque origin, and
  // every other layer is built on top of it. Adding it back to "make debugging easier" would undo
  // the sandbox entirely.
  frame.setAttribute('sandbox', 'allow-scripts');
  frame.setAttribute('aria-hidden', 'true');
  frame.setAttribute('tabindex', '-1');
  frame.style.cssText = 'position:absolute;width:0;height:0;border:0;visibility:hidden;';
  frame.src = options.sandboxUrl;

  const resolved = {
    fetchImpl: options.fetchImpl ?? ambientFetch(),
    storage: options.storage ?? memoryStorage(),
    parseXml: options.parseXml ?? defaultParseXml,
    onLog: options.onLog ?? (() => {}),
    callTimeoutMs: options.callTimeoutMs ?? DEFAULT_CALL_TIMEOUT_MS,
    fetchTimeoutMs: options.fetchTimeoutMs ?? DEFAULT_FETCH_TIMEOUT_MS,
    maxChars: options.maxChars ?? DEFAULT_MAX_CHARS,
  };

  return new Promise<SandboxedAddon>((resolve, reject) => {
    let addon: SandboxedAddon | null = null;
    let settled = false;

    const bootTimer = setTimeout(() => {
      fail(new AddonError('The addon sandbox did not start.'));
    }, options.bootTimeoutMs ?? DEFAULT_BOOT_TIMEOUT_MS);

    function fail(error: Error): void {
      if (settled) return;
      settled = true;
      clearTimeout(bootTimer);
      globalThis.removeEventListener('message', onMessage);
      frame.remove();
      reject(error);
    }

    function onMessage(event: MessageEvent): void {
      // The handle, not the origin: an opaque origin arrives as the string `"null"`, which every
      // other sandboxed frame on the page would also send. Identity is `contentWindow`.
      if (event.source !== frame.contentWindow) return;
      const message = readSandboxMessage(event.data);
      if (!message) return;

      switch (message.type) {
        case 'booted':
          frame.contentWindow?.postMessage(
            {
              v: SANDBOX_PROTOCOL_VERSION,
              type: 'start',
              addonId: 'pending',
              source: composeWorkerSource(bundleSource),
            } satisfies HostMessage,
            '*',
          );
          return;

        case 'ready': {
          if (settled) return;
          let manifest: AddonManifest;
          try {
            manifest = parseAddonManifest(message.manifest, 'This addon');
          } catch (error) {
            fail(error instanceof Error ? error : new AddonError(String(error)));
            return;
          }
          settled = true;
          clearTimeout(bootTimer);
          addon = SandboxedAddon.adopt(manifest, frame, onMessage, resolved);
          resolve(addon);
          return;
        }

        case 'invokeResult':
          addon?.settle(message.callId, message.ok, message.ok ? message.value : message.error);
          return;

        case 'capability': {
          const reply = (ok: boolean, payload: unknown): void => {
            frame.contentWindow?.postMessage(
              ok
                ? {
                    v: SANDBOX_PROTOCOL_VERSION,
                    type: 'capabilityResult',
                    callId: message.callId,
                    ok: true,
                    value: payload,
                  }
                : {
                    v: SANDBOX_PROTOCOL_VERSION,
                    type: 'capabilityResult',
                    callId: message.callId,
                    ok: false,
                    error: String(payload),
                  },
              '*',
            );
          };
          runCapability(message.name, message.args, {
            addonId: addon?.manifest.id ?? 'pending',
            allowedHosts: addon?.manifest.permissions?.hosts ?? [],
            fetchImpl: resolved.fetchImpl,
            timeoutMs: resolved.fetchTimeoutMs,
            maxChars: resolved.maxChars,
            storage: resolved.storage,
            parseXml: resolved.parseXml,
            onLog: resolved.onLog,
          }).then(
            (value) => reply(true, value),
            (error: unknown) =>
              reply(false, error instanceof Error ? error.message : String(error)),
          );
          return;
        }

        case 'fatal':
          if (settled) addon?.destroy(message.error);
          else fail(new AddonError(message.error));
          return;
      }
    }

    globalThis.addEventListener('message', onMessage);
    container.appendChild(frame);
  });
}

function defaultParseXml(text: string): unknown {
  if (typeof DOMParser === 'undefined') {
    throw new AddonError('This environment cannot parse XML for addons.');
  }
  const document_ = new DOMParser().parseFromString(text, 'application/xml');
  const failure = document_.querySelector('parsererror');
  if (failure) throw new AddonError('That document is not well-formed XML.');
  return toPlain(document_.documentElement);
}

/** A DOM tree flattened into something structured clone can carry back to the worker. */
function toPlain(element: Element): unknown {
  const node: Record<string, unknown> = {};
  for (const attribute of Array.from(element.attributes)) {
    node[`@${attribute.name}`] = attribute.value;
  }
  const children = Array.from(element.children);
  if (children.length === 0) {
    const text = element.textContent ?? '';
    if (Object.keys(node).length === 0) return text;
    node['#text'] = text;
    return node;
  }
  for (const child of children) {
    const value = toPlain(child);
    const existing = node[child.tagName];
    if (existing === undefined) node[child.tagName] = value;
    else if (Array.isArray(existing)) existing.push(value);
    else node[child.tagName] = [existing, value];
  }
  return node;
}
