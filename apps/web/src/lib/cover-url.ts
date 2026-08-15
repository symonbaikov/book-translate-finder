import { webEnv } from '../config/web-env';

/**
 * Hosts whose covers are worth relaying through this instance.
 *
 * Kept in step with the API's own allowlist (`packages/domain/src/policy/cover-hosts.ts`), which
 * is the one that decides — this list only avoids sending it a URL it is going to refuse. A host
 * missing here costs nothing but the old slow path; a host missing *there* is a 404.
 */
const RELAYED_HOSTS = [
  'covers.openlibrary.org',
  'books.google.com',
  'books.googleusercontent.com',
  'commons.wikimedia.org',
  'upload.wikimedia.org',
];

/**
 * A cover URL pointed at this instance instead of at the source.
 *
 * Measured on the real thing: one cover from `covers.openlibrary.org` costs two redirects and
 * about 2.6 seconds, because the URL answers 302 to archive.org, which answers 302 to whichever
 * node holds the archive the image sits in — so the browser pays a DNS lookup, a TLS handshake
 * and a round trip to a third host for *every* cover in a grid. Twenty of them took 8.3 seconds.
 * Nothing failed; the covers simply arrived one every few seconds, which reads as "the covers
 * don't load".
 *
 * Through `/api/covers` the bytes come from a host the browser already has a connection open to,
 * and after the first reader they come from Redis.
 *
 * `NEXT_PUBLIC_API_URL` and never `INTERNAL_API_URL`: this URL is resolved by the reader's
 * browser, so a container-internal address would be unreachable — the exact failure recorded for
 * SSR fetches in web-env.ts, in the opposite direction.
 */
export function coverImageUrl(src: string | null): string | null {
  if (!src) return null;

  let host: string;
  try {
    const url = new URL(src);
    if (url.protocol !== 'https:') return src;
    host = url.hostname.toLowerCase();
  } catch {
    // Not an absolute URL — a relative or already-proxied path. Leave it exactly as given.
    return src;
  }

  if (!RELAYED_HOSTS.includes(host)) return src;
  return `${webEnv.NEXT_PUBLIC_API_URL}/api/covers?src=${encodeURIComponent(src)}`;
}
