import type { AddonContentType, AddonManifest } from './manifest.js';
import type { CatalogResponse, MetaResponse, SourcesResponse } from './resources.js';

/**
 * The one interface both kinds of addon implement.
 *
 * An HTTP addon runs on its author's server and is reached by URL. A local addon is code the reader
 * installed, executing in a sandbox on their device. They differ in everything except this: three
 * questions, asked the same way, answered in the same shapes. Which one an addon is stays a
 * property of its descriptor and never becomes a branch in the calling code — the registry, the
 * aggregation and the entire interface are written once
 * (docs/adr/0010-addon-engine.md §2).
 */
export interface AddonTransport {
  readonly manifest: AddonManifest;
  getCatalog(
    type: AddonContentType,
    catalogId: string,
    extra?: AddonExtra,
  ): Promise<CatalogResponse>;
  getMeta(type: AddonContentType, id: string): Promise<MetaResponse>;
  getSources(type: AddonContentType, id: string): Promise<SourcesResponse>;
}

/** The three catalog parameters, as the caller supplies them. */
export interface AddonExtra {
  readonly search?: string;
  readonly genre?: string;
  /** Offset for paging. The addon decides the page size; the core just asks for what comes next. */
  readonly skip?: number;
}

/**
 * How an installed addon was obtained — the part the reader's browser stores, and the only part
 * that differs between the two transports.
 *
 * `integrity` is required for a local addon and there is no opt-out: the bundle is code that will
 * run on the reader's device, and an addon that can silently change what it does after being
 * approved was never really approved. A mismatch is a refusal to run, not a warning.
 */
export type AddonDescriptor =
  | { readonly kind: 'http'; readonly manifestUrl: string }
  | { readonly kind: 'local'; readonly bundleUrl: string; readonly integrity: string }
  /**
   * A transport the application itself provides — today only the reader's own OPDS catalogs, which
   * need the OPDS parsers in `@golden/plugins` and so cannot be built here (both packages are
   * leaves and neither may import the other; `apps/web` is where they meet).
   *
   * `builtin` is a name this package deliberately does not interpret and `config` is opaque to it.
   * That is what keeps the engine from learning what OPDS is, which is the same reason it does not
   * know what Gutenberg is.
   */
  | {
      readonly kind: 'builtin';
      readonly builtin: string;
      readonly config: Readonly<Record<string, string>>;
    };

/** An addon as the registry holds it: what the reader installed, and how to talk to it. */
export interface InstalledAddon {
  readonly descriptor: AddonDescriptor;
  readonly transport: AddonTransport;
  /** Off keeps an addon installed and its configuration intact while excluding it from results. */
  readonly enabled: boolean;
}

/**
 * The ambient `fetch`, bound to the global object.
 *
 * The binding is not a style choice. In a browser, `fetch` is a method of `Window` and refuses to
 * run with the wrong receiver — pulling it out as `const f = globalThis.fetch` and calling `f(url)`
 * throws `TypeError: Illegal invocation`. Node's `fetch` does not care, so the mistake typechecks,
 * passes every unit test, and then fails only in the one environment this package mostly runs in.
 * It was found by driving the real page, and `transport.test.ts` now models the browser's rule so
 * it cannot come back.
 */
export function ambientFetch(): FetchLike {
  const impl = globalThis.fetch;
  if (typeof impl !== 'function') {
    throw new Error('This environment has no fetch, so addons cannot be reached.');
  }
  return impl.bind(globalThis) as unknown as FetchLike;
}

/** The subset of `fetch` this package uses, so tests and the sandbox can supply their own. */
export type FetchLike = (
  input: string,
  init?: {
    headers?: Record<string, string>;
    signal?: AbortSignal;
    redirect?: 'follow' | 'error';
    method?: string;
    body?: string;
    /**
     * Always `'omit'` in this package, and not a default worth relying on. An addon is a
     * third-party origin; sending it whatever cookies the browser happens to hold would leak a
     * session to somebody the reader installed on a whim.
     */
    credentials?: 'omit';
    /** Likewise `'no-referrer'`: which page the reader was on is not the addon's business. */
    referrerPolicy?: 'no-referrer';
  },
) => Promise<{
  ok: boolean;
  status: number;
  text(): Promise<string>;
  headers: { get(name: string): string | null };
}>;
