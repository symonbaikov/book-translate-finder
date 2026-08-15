import { InvalidInputError } from '../errors/domain-error.js';

/**
 * The hosts this instance will relay a cover image from.
 *
 * A closed allowlist, and for the same reason `LinkPolicy` has one: the endpoint that serves these
 * takes a URL from the caller and fetches it, so without a list of permitted hosts it is an open
 * proxy — anyone could point it at a private address on the machine's own network and read the
 * answer back. Every entry here is a host this project already gets cover images from, and adding
 * one is a deliberate, reviewed act rather than a configuration setting.
 *
 * Only the host is checked, never the path: these services all key covers by identifiers that
 * change shape over time, and a path pattern would break quietly the day one of them adds a size.
 */
const COVER_HOSTS: readonly string[] = [
  'covers.openlibrary.org',
  // Where covers.openlibrary.org redirects — the image itself lives on the Internet Archive, on a
  // per-request node, so the whole family has to be permitted for a followed redirect to land.
  'archive.org',
  'ia600000.us.archive.org',
  'books.google.com',
  'books.googleusercontent.com',
  'commons.wikimedia.org',
  'upload.wikimedia.org',
];

/** `ia902809.us.archive.org` and its siblings — the node number is assigned per request. */
const ARCHIVE_NODE = /^ia\d+\.us\.archive\.org$/;

export function isAllowedCoverHost(host: string): boolean {
  const normalized = host.trim().toLowerCase();
  return COVER_HOSTS.includes(normalized) || ARCHIVE_NODE.test(normalized);
}

/**
 * The URL to relay, or `null` when it is not one this instance will fetch.
 *
 * `null` rather than a throw: a cover is decoration, and a caller asking for one from an
 * unexpected host is answered with "no image" — the same answer as a cover that does not exist.
 */
export function coverSourceUrl(raw: string): URL | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  // `https` only. A cover fetched over plain HTTP is a request an attacker on the path can answer,
  // and every source here serves TLS.
  if (url.protocol !== 'https:') return null;
  return isAllowedCoverHost(url.hostname) ? url : null;
}

/** Guards the allowlist itself: an entry that is not a bare hostname is a mistake, not a host. */
export function assertCoverHostsWellFormed(): void {
  for (const host of COVER_HOSTS) {
    if (host !== host.trim().toLowerCase() || host.includes('/') || host.includes(':')) {
      throw new InvalidInputError(`Cover host allowlist entry is not a hostname: ${host}`);
    }
  }
}
