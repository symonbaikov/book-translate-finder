import { AddonResponseError, AddonTransportError } from '../errors.js';
import {
  addonSupports,
  parseAddonManifest,
  type AddonContentType,
  type AddonManifest,
  type AddonResource,
} from '../manifest.js';
import {
  BookMetaPreviewSchema,
  AddonSourceSchema,
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
import { addonBaseUrl, manifestUrlOf, resourceUrl } from './addon-url.js';

/**
 * An addon that lives on somebody else's server, reached over plain HTTP — the Stremio arrangement.
 *
 * Everything here runs in the reader's browser and talks to the addon directly. Nothing passes
 * through the Golden Library instance, which has no route that would fetch a URL on anyone's behalf
 * and will not be given one (docs/adr/0010-addon-engine.md §6).
 *
 * The privacy cost of that is real and belongs stated rather than buried: the addon's operator sees
 * the reader's IP address and every query sent to them. It is the price of the transport, the
 * install screen says so, and a reader who does not want to pay it can use a local addon instead.
 */

const DEFAULT_TIMEOUT_MS = 10_000;
/** Generous for a page of book records, small enough that a runaway response cannot eat the tab. */
const DEFAULT_MAX_CHARS = 4 * 1024 * 1024;

export interface HttpAddonOptions {
  readonly fetchImpl?: FetchLike;
  readonly timeoutMs?: number;
  readonly maxChars?: number;
}

export class HttpAddonTransport implements AddonTransport {
  private readonly baseUrl: string;
  private readonly fetchImpl: FetchLike;
  private readonly timeoutMs: number;
  private readonly maxChars: number;

  constructor(
    readonly manifest: AddonManifest,
    baseUrl: string,
    options: HttpAddonOptions = {},
  ) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.fetchImpl = options.fetchImpl ?? ambientFetch();
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxChars = options.maxChars ?? DEFAULT_MAX_CHARS;
  }

  async getCatalog(
    type: AddonContentType,
    catalogId: string,
    extra?: AddonExtra,
  ): Promise<CatalogResponse> {
    const body = await this.request('catalog', type, catalogId, extra);
    const envelope = CatalogEnvelopeSchema.safeParse(body);
    if (!envelope.success) throw this.malformed('catalog');
    const { kept, dropped } = collectValid(BookMetaPreviewSchema, envelope.data.metas);
    return { metas: kept, dropped };
  }

  async getMeta(type: AddonContentType, id: string): Promise<MetaResponse> {
    const body = await this.request('meta', type, id);
    const parsed = MetaResponseSchema.safeParse(body);
    if (!parsed.success) throw this.malformed('meta');
    return parsed.data;
  }

  async getSources(type: AddonContentType, id: string): Promise<SourcesResponse> {
    const body = await this.request('source', type, id);
    const envelope = SourcesEnvelopeSchema.safeParse(body);
    if (!envelope.success) throw this.malformed('source');
    const { kept, dropped } = collectValid(AddonSourceSchema, envelope.data.sources);
    return { sources: kept, dropped };
  }

  private malformed(resource: AddonResource): AddonResponseError {
    return new AddonResponseError(
      `${this.manifest.name} answered a ${resource} request in a shape this engine cannot read.`,
      this.manifest.id,
    );
  }

  private async request(
    resource: AddonResource,
    type: AddonContentType,
    id: string,
    extra?: AddonExtra,
  ): Promise<unknown> {
    if (!addonSupports(this.manifest, resource, type, id)) {
      throw new AddonResponseError(
        `${this.manifest.name} does not offer ${resource} for ${type}.`,
        this.manifest.id,
      );
    }
    const url = resourceUrl(this.baseUrl, resource, type, id, extra);
    return fetchAddonJson(url, {
      fetchImpl: this.fetchImpl,
      timeoutMs: this.timeoutMs,
      maxChars: this.maxChars,
    });
  }
}

/**
 * Installs an addon from its manifest URL — the whole of "installing" for this transport, since
 * there is no code to download and nothing to keep but the address.
 */
export async function installHttpAddon(
  manifestUrl: string,
  options: HttpAddonOptions = {},
): Promise<HttpAddonTransport> {
  const base = addonBaseUrl(manifestUrl);
  const canonical = manifestUrlOf(base);
  const body = await fetchAddonJson(canonical, {
    fetchImpl: options.fetchImpl ?? ambientFetch(),
    timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    maxChars: options.maxChars ?? DEFAULT_MAX_CHARS,
  });
  const manifest = parseAddonManifest(body, canonical);
  return new HttpAddonTransport(manifest, base, options);
}

async function fetchAddonJson(
  url: string,
  options: { fetchImpl: FetchLike; timeoutMs: number; maxChars: number },
): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs);
  try {
    const response = await options.fetchImpl(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
      // A redirect to another origin is fine — addons move — but the two below are not defaults
      // this package is willing to inherit. See the note on `FetchLike`.
      redirect: 'follow',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
    });

    if (!response.ok) {
      throw new AddonTransportError(`The addon answered ${response.status}.`, response.status);
    }

    // Checked before reading where the server declares it, and again after, because the header is
    // advisory and a hostile or broken addon can simply not send one. The unit is characters
    // rather than bytes — close enough for a ceiling whose job is to stop a runaway, and it does
    // not require decoding the body twice to find out.
    const declared = Number(response.headers.get('content-length') ?? '');
    if (Number.isFinite(declared) && declared > options.maxChars * 4) {
      throw new AddonTransportError('The addon’s answer is too large to read.', null);
    }
    const text = await response.text();
    if (text.length > options.maxChars) {
      throw new AddonTransportError('The addon’s answer is too large to read.', null);
    }

    try {
      return JSON.parse(text) as unknown;
    } catch {
      throw new AddonTransportError('The addon answered with something that is not JSON.', null);
    }
  } catch (error) {
    if (error instanceof AddonTransportError) throw error;
    // Everything else the browser can throw here is indistinguishable from the outside — an
    // offline network, DNS, a refused CORS preflight and our own abort all surface as a bare
    // TypeError. Saying which of them it was would be a guess, so the message names the two the
    // reader can actually do something about.
    const reason = controller.signal.aborted
      ? `it did not answer within ${options.timeoutMs}ms`
      : 'the request could not be made — the addon may be offline, or may not allow browsers to read its responses (CORS)';
    throw new AddonTransportError(`Could not reach the addon: ${reason}.`, null);
  } finally {
    clearTimeout(timer);
  }
}
