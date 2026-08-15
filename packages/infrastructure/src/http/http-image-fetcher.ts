import { coverSourceUrl, type FetchedImage, type ImageFetchPort } from '@golden/domain';
import type { ResilientFetcher } from './resilient-fetch.js';

/**
 * A cover is tens of kilobytes; anything past this is not a book jacket, and holding it in memory
 * to base64 it into Redis is how one bad URL becomes an out-of-memory kill on a self-hosted box.
 */
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

/** Followed by hand rather than by `fetch`, so every hop can be checked against the allowlist. */
const MAX_REDIRECTS = 4;

/**
 * `ImageFetchPort` over HTTP.
 *
 * Redirects are followed **manually**. `fetch`'s own redirect handling would take the response
 * from wherever the chain ended up, and this chain leaves the host that was checked: Open Library
 * answers 302 to `archive.org`, which answers 302 to a per-request `ia*.us.archive.org` node. An
 * allowlist checked only at the first hop is not an allowlist, so each `Location` is re-checked
 * before it is followed — which is also why those hosts are on the list.
 */
export class HttpImageFetcher implements ImageFetchPort {
  constructor(
    private readonly fetcher: ResilientFetcher,
    private readonly userAgent: string,
  ) {}

  async fetchImage(url: string): Promise<FetchedImage | null> {
    let current = coverSourceUrl(url);
    if (!current) return null;

    for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
      const res = await this.fetcher.fetch(current.toString(), {
        headers: { 'User-Agent': this.userAgent, Accept: 'image/*' },
        redirect: 'manual',
      });

      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get('location');
        if (!location) return null;
        const next = coverSourceUrl(new URL(location, current).toString());
        // A redirect off the allowlist is where an open proxy would begin. It ends here instead.
        if (!next) return null;
        current = next;
        continue;
      }

      if (!res.ok) return null;

      const contentType = res.headers.get('content-type') ?? '';
      // The source's own word for what it sent. Anything that is not an image — an HTML error
      // page, a rate-limit notice — is not something to hand a reader's browser as a cover.
      if (!contentType.startsWith('image/')) return null;

      const buffer = await res.arrayBuffer();
      if (buffer.byteLength === 0 || buffer.byteLength > MAX_IMAGE_BYTES) return null;

      return { bytes: new Uint8Array(buffer), contentType: contentType.split(';')[0]!.trim() };
    }

    return null;
  }
}
