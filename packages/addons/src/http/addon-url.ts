import type { AddonContentType, AddonResource } from '../manifest.js';
import type { AddonExtra } from '../transport.js';

/**
 * Stremio's URL layout, kept deliberately compatible.
 *
 * ```
 * {base}/manifest.json
 * {base}/catalog/{type}/{id}.json
 * {base}/catalog/{type}/{id}/search=dune&skip=100.json
 * {base}/meta/{type}/{id}.json
 * {base}/source/{type}/{id}.json
 * ```
 *
 * The last one is where this diverges: Stremio calls it `stream`, and a book is not a stream. Every
 * other rule — the trailing `.json`, the extras collapsed into a single path segment, the `&`
 * between them — is copied rather than improved on, because an author who has written a Stremio
 * addon should be able to write one of these without relearning anything.
 *
 * Values are percent-encoded, which matters more here than it looks: a search for `a/b` must not
 * turn into another path segment, and an id containing a slash (Open Library's `/works/OL1W` does)
 * must survive the round trip.
 */

/** Everything before the resource segment, with no trailing slash. */
export function addonBaseUrl(manifestUrl: string): string {
  const url = new URL(manifestUrl);
  url.hash = '';
  url.search = '';
  url.pathname = url.pathname.replace(/\/manifest\.json$/i, '').replace(/\/+$/, '');
  // `URL` puts a slash back when the path is empty, and every caller here concatenates onto this
  // string — leaving it would produce `https://addon.example//catalog/…`.
  return url.toString().replace(/\/+$/, '');
}

export function manifestUrlOf(baseUrl: string): string {
  return `${baseUrl.replace(/\/+$/, '')}/manifest.json`;
}

export function resourceUrl(
  baseUrl: string,
  resource: AddonResource,
  type: AddonContentType,
  id: string,
  extra?: AddonExtra,
): string {
  const segments = [
    baseUrl.replace(/\/+$/, ''),
    resource,
    encodeURIComponent(type),
    encodeURIComponent(id),
  ];
  const query = encodeExtra(extra);
  if (query) segments.push(query);
  return `${segments.join('/')}.json`;
}

/**
 * `search=dune&skip=100`, percent-encoded, in a fixed order.
 *
 * Fixed rather than insertion order because this string ends up in a URL that will be cached — by
 * the browser, by whatever sits in front of the addon, and by us if we ever add a cache. Two
 * requests for the same thing must produce the same URL, and object key order is not a promise
 * worth relying on for that.
 */
export function encodeExtra(extra: AddonExtra | undefined): string {
  if (!extra) return '';
  const parts: string[] = [];
  if (extra.search !== undefined && extra.search !== '') {
    parts.push(`search=${encodeURIComponent(extra.search)}`);
  }
  if (extra.genre !== undefined && extra.genre !== '') {
    parts.push(`genre=${encodeURIComponent(extra.genre)}`);
  }
  if (extra.skip !== undefined && extra.skip > 0) {
    parts.push(`skip=${encodeURIComponent(String(Math.floor(extra.skip)))}`);
  }
  return parts.join('&');
}
