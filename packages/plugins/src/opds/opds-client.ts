import type { Plugin, PluginManifest } from '../plugin.js';
import { OpdsParseError, type OpdsFeed } from './model.js';
import { applySearchTemplate, parseOpdsDocument, parseOpenSearchTemplate } from './parse.js';

/**
 * The OPDS client (Module A).
 *
 * **Where it runs.** Both sides, on purpose. The reader's own Calibre/Kavita/Audiobookshelf server
 * usually lives on a private address that our backend cannot reach and must not be told about, so
 * for those the browser is the only correct place to fetch from — and the only place the feed URL
 * ever exists (docs/adr/0007). The same class runs server-side for the public catalogs, where a
 * shared cache is worth more than per-reader isolation.
 *
 * **What it does not do.** It never follows a link on its own initiative, never fetches an
 * acquisition URL to "check" it, and never sends the feed anywhere. It fetches the URL it is
 * given, parses it, and returns the result.
 */

export type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

export interface OpdsCredentials {
  readonly username: string;
  readonly password: string;
}

export interface OpdsClientOptions {
  readonly fetch?: FetchLike;
  /** Bounds how long a page waits on an unresponsive server. */
  readonly timeoutMs?: number;
  /**
   * Refuses to buffer a response larger than this. A misconfigured URL that returns a disk image
   * should fail fast rather than exhaust the tab's memory.
   */
  readonly maxBytes?: number;
  /** Sent on every request; public-API etiquette (docs/legal-policy.md §4). */
  readonly userAgent?: string;
}

export interface OpdsRequest {
  readonly url: string;
  /** HTTP Basic credentials for a reader's own password-protected server. */
  readonly credentials?: OpdsCredentials;
  readonly signal?: AbortSignal;
}

const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_MAX_BYTES = 8 * 1024 * 1024;

/**
 * Advertises both OPDS versions and lets the server choose. Ordering matters: a server that speaks
 * 2.0 gives a richer document, but 1.2 is what most of them actually serve.
 */
const ACCEPT =
  'application/opds+json, application/atom+xml;profile=opds-catalog, application/atom+xml;q=0.9, application/xml;q=0.8, */*;q=0.1';

export class OpdsFetchError extends Error {
  constructor(
    message: string,
    readonly status: number | null,
  ) {
    super(message);
    this.name = 'OpdsFetchError';
  }
}

/**
 * Only `http:` and `https:` are accepted. `file:` would let a pasted URL read the reader's disk
 * through their own browser, and the custom schemes are not fetchable in either runtime.
 */
export function assertFetchableFeedUrl(url: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new OpdsFetchError(`Not a valid absolute URL: ${url}`, null);
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new OpdsFetchError(`Unsupported URL scheme for an OPDS feed: ${parsed.protocol}`, null);
  }
  return parsed;
}

/** UTF-8 safe HTTP Basic value; `btoa` alone mangles any non-ASCII character in a password. */
function basicAuthHeader(credentials: OpdsCredentials): string {
  const raw = `${credentials.username}:${credentials.password}`;
  const utf8 = encodeURIComponent(raw).replace(/%([0-9A-F]{2})/g, (_match, hex: string) =>
    String.fromCharCode(Number.parseInt(hex, 16)),
  );
  return `Basic ${btoa(utf8)}`;
}

export class OpdsClient {
  private readonly fetchImpl: FetchLike;
  private readonly timeoutMs: number;
  private readonly maxBytes: number;
  private readonly userAgent: string | null;

  constructor(options: OpdsClientOptions = {}) {
    // Falls back to the ambient `fetch` (Node 20 and every browser have it) so callers that do
    // not care about injection do not have to pass one, while tests always can.
    this.fetchImpl = options.fetch ?? ((url, init) => fetch(url, init));
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
    this.userAgent = options.userAgent ?? null;
  }

  async fetchFeed(request: OpdsRequest): Promise<OpdsFeed> {
    const { body, contentType, finalUrl } = await this.get(request);
    return parseOpdsDocument(body, { feedUrl: finalUrl, contentType });
  }

  /**
   * Runs a search against a feed that advertises one. Two requests by necessity: `rel="search"`
   * points at an OpenSearch *description*, and the query template lives inside it.
   */
  async search(request: OpdsRequest & { terms: string }): Promise<OpdsFeed> {
    const feed = await this.fetchFeed(request);
    if (!feed.searchDescriptionUrl) {
      throw new OpdsParseError(`Feed does not advertise a search endpoint: ${request.url}`);
    }

    const description = await this.get({ ...request, url: feed.searchDescriptionUrl });
    // Some servers point `rel="search"` straight at a query template instead of a description
    // document (COPS does). Detect it by the document being a feed and use the URL as-is.
    const template = description.body.includes('OpenSearchDescription')
      ? parseOpenSearchTemplate(description.body)
      : null;
    if (!template) {
      throw new OpdsParseError(
        `Search endpoint did not yield a usable URL template: ${feed.searchDescriptionUrl}`,
      );
    }

    const searchUrl = new URL(
      applySearchTemplate(template, request.terms),
      feed.searchDescriptionUrl,
    ).toString();
    return this.fetchFeed({ ...request, url: searchUrl });
  }

  private async get(
    request: OpdsRequest,
  ): Promise<{ body: string; contentType: string | null; finalUrl: string }> {
    const url = assertFetchableFeedUrl(request.url).toString();

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    // The caller's signal (a component unmounting) must also stop the request, so both are wired
    // to the one the transport sees.
    request.signal?.addEventListener('abort', () => controller.abort(), { once: true });

    try {
      const headers: Record<string, string> = { Accept: ACCEPT };
      if (this.userAgent) headers['User-Agent'] = this.userAgent;
      if (request.credentials) headers['Authorization'] = basicAuthHeader(request.credentials);

      const response = await this.fetchImpl(url, {
        headers,
        signal: controller.signal,
        redirect: 'follow',
      });

      if (!response.ok) {
        throw new OpdsFetchError(
          `Feed request failed with HTTP ${response.status}: ${url}`,
          response.status,
        );
      }

      const declaredLength = Number(response.headers.get('content-length'));
      if (Number.isFinite(declaredLength) && declaredLength > this.maxBytes) {
        throw new OpdsFetchError(
          `Feed is larger than the ${this.maxBytes} byte limit: ${url}`,
          response.status,
        );
      }

      const body = await response.text();
      if (body.length > this.maxBytes) {
        throw new OpdsFetchError(
          `Feed is larger than the ${this.maxBytes} byte limit: ${url}`,
          response.status,
        );
      }

      return {
        body,
        contentType: response.headers.get('content-type'),
        // Relative hrefs must resolve against where the document actually came from, not where we
        // asked — a feed that redirects `/opds` to `/opds/v1.2/` otherwise produces broken links.
        finalUrl: response.url || url,
      };
    } finally {
      clearTimeout(timer);
    }
  }
}

/** A registered OPDS catalog: either one shipped with the app or one the reader added. */
export interface OpdsFeedPlugin extends Plugin {
  readonly manifest: PluginManifest & { readonly kind: 'opds-feed' };
  readonly url: string;
  /** Set by the reader for their own server; never persisted server-side. */
  readonly credentials?: OpdsCredentials;
  /**
   * Origins a relay may follow links to, beyond `url`'s own. Real catalogs span hosts: Project
   * Gutenberg's OPDS root is on `m.gutenberg.org` while every link inside it points at
   * `www.gutenberg.org`, so a strict same-origin rule makes the catalog unnavigable after the
   * first page (found the moment the shelf was clicked in a browser).
   *
   * Listed explicitly rather than derived by stripping subdomains: a registrable-domain
   * comparison needs the public suffix list to be correct, and this list is short, operator-owned
   * and auditable — which is exactly the property that keeps the relay from becoming an open proxy.
   */
  readonly allowedOrigins?: readonly string[];
}
