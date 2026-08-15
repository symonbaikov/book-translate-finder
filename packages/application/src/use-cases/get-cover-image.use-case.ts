import { coverSourceUrl, sha256Hex, type CachePort, type ImageFetchPort } from '@golden/domain';
import type { UseCase } from '../use-case.js';
import { CACHE_KEY_VERSION } from '../cache-key-version.js';

export interface GetCoverImageInput {
  /** The source URL of the cover, as stored on the work or edition. */
  src: string;
}

export type GetCoverImageOutput =
  | { status: 'ok'; bytes: Uint8Array; contentType: string }
  /** The host is not on the allowlist, or the source had no usable image there. */
  | { status: 'unavailable' };

export interface GetCoverImageDeps {
  images: ImageFetchPort;
  cache: CachePort;
}

/**
 * A month. Cover images are effectively immutable — Open Library's own response says
 * `expires` in 2126 — so the only reason this is not forever is that a Redis holding every cover
 * an instance has ever served is not what a self-hosted box has spare memory for.
 */
const COVER_TTL_SECONDS = 30 * 24 * 60 * 60;

/** Cached as base64 in the same JSON-valued cache as everything else, at ~33% overhead. */
interface CachedCover {
  base64: string;
  contentType: string;
}

export function coverCacheKey(src: string): string {
  return `${CACHE_KEY_VERSION}:cover:${sha256Hex(src)}`;
}

/**
 * `GET /api/covers?src=` — this instance serving a cover image itself instead of sending the
 * reader to fetch it from Open Library.
 *
 * Measured, which is the whole reason it exists: one cover from `covers.openlibrary.org` costs
 * **two redirects and 2.65 seconds** — the URL answers 302 to `archive.org`, which answers 302
 * to whichever `ia*.us.archive.org` node holds the zip the image lives in, so the browser pays a
 * DNS lookup, a TLS handshake and a round trip to a *third* host for every cover on the page.
 * Twenty covers, six at a time, took 8.3 seconds. Nothing was failing; a grid of books simply
 * arrived one cover every couple of seconds, which a reader reads as "the covers don't load".
 *
 * Served from here, the first reader pays that once and everyone after gets the bytes from Redis
 * over the connection their browser already has open to this instance. It also takes this
 * instance's readers out of Open Library's per-IP cover rate limit, which a single work page used
 * to exhaust on its own.
 *
 * The host allowlist (`coverSourceUrl`) is what keeps this from being an open proxy — see the note
 * there. Anything it rejects, and anything the source does not answer with an image, is
 * `unavailable`, which the UI already knows how to draw: the typographic placeholder it shows for
 * a book with no cover at all.
 */
export class GetCoverImage implements UseCase<GetCoverImageInput, GetCoverImageOutput> {
  constructor(private readonly deps: GetCoverImageDeps) {}

  async execute(input: GetCoverImageInput): Promise<GetCoverImageOutput> {
    const url = coverSourceUrl(input.src);
    if (!url) return { status: 'unavailable' };

    const key = coverCacheKey(url.toString());
    const cached = await this.deps.cache.get<CachedCover>(key);
    if (cached) {
      return {
        status: 'ok',
        bytes: Uint8Array.from(Buffer.from(cached.base64, 'base64')),
        contentType: cached.contentType,
      };
    }

    const image = await this.deps.images.fetchImage(url.toString());
    if (!image) return { status: 'unavailable' };

    await this.deps.cache.set<CachedCover>(
      key,
      { base64: Buffer.from(image.bytes).toString('base64'), contentType: image.contentType },
      COVER_TTL_SECONDS,
    );
    return { status: 'ok', bytes: image.bytes, contentType: image.contentType };
  }
}
