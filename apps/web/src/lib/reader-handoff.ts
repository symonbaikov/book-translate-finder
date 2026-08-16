'use client';

/**
 * How a book's address reaches `/read` without reaching this instance.
 *
 * `/read?src=https://…` would hand the file's URL to this server in the request line of an ordinary
 * navigation — before a line of our code runs, into whatever access log the operator keeps. That is
 * the one thing this whole feature is built not to do ([ADR-0013](../../../../docs/adr/0013-client-side-reader.md) §1),
 * so the query string is the one carrier that is forbidden. Two are allowed:
 *
 * - **`sessionStorage`**, for a link inside this site. The address never appears anywhere at all —
 *   not in the URL bar, not in history, not on the wire.
 * - **the URL fragment** (`/read#src=…`), for a link somebody pasted or shared. A fragment is never
 *   sent to a server by any browser, which is exactly the property needed here.
 *
 * Both are read once and cleared, fragment included: an address left in the URL bar outlives the
 * moment it was useful, and ends up in a screenshot or a bookmark.
 */

const KEY = 'btf.reader.handoff';
const FRAGMENT_PREFIX = '#src=';

/**
 * Where a "Read in your browser" link should point, having stashed the address.
 *
 * Returns plain `/read` when the stash worked, and the fragment form when it did not — a reader
 * with `sessionStorage` switched off still gets their book, just with the address visible in the
 * URL bar for a moment. Neither form reaches the server.
 */
export function handBookTo(url: string): string {
  try {
    window.sessionStorage.setItem(KEY, url);
    return '/read';
  } catch {
    return `/read${FRAGMENT_PREFIX}${encodeURIComponent(url)}`;
  }
}

/**
 * The address this page was opened with, if any — read once, then erased from both carriers.
 *
 * Erasing the fragment uses `replaceState` rather than assigning `location.hash`, which would add a
 * history entry and put the reader one Back press away from re-opening the same book.
 */
export function takeHandoff(): string | null {
  let url: string | null = null;

  const hash = window.location.hash;
  if (hash.startsWith(FRAGMENT_PREFIX)) {
    url = decodeURIComponent(hash.slice(FRAGMENT_PREFIX.length));
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }

  try {
    url ??= window.sessionStorage.getItem(KEY);
    window.sessionStorage.removeItem(KEY);
  } catch {
    // Storage refused: there was nothing stashed there to begin with.
  }

  return url && url.trim() ? url : null;
}
