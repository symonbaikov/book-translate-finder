import {
  ProviderId,
  Rating,
  type CachePort,
  type EditionRatingProvider,
  type EditionRatingResult,
  type RatingQuery,
} from '@golden/domain';
import type { ResilientFetcher } from '../http/resilient-fetch.js';

/**
 * Reader ratings for one edition, from Google Books.
 *
 * The only open API this project found that rates a *volume* rather than a work. Open Library's
 * `ratings.json` exists only under `/works/` — asking it for an edition answers `notfound`
 * (verified live) — and a work-level average is the same number under every translation, which is
 * exactly the comparison this feature is for and exactly what that number cannot make. Goodreads,
 * LiveLib and Babelio all rate editions and none of them has an API since Goodreads closed theirs
 * in December 2020; scraping them is barred outright (docs/legal-policy.md I-3).
 *
 * **A key is not optional here, despite Google's docs.** The keyless quota is a single shared
 * Google project and it is permanently exhausted — Phase 0 hit `RESOURCE_EXHAUSTED` on its very
 * first anonymous request and the price provider draws the same conclusion (docs/plan.md 4.10).
 * Without `GOOGLE_BOOKS_API_KEY` this adapter answers `null` for everything rather than spending
 * a request on a guaranteed 429.
 *
 * **ISBN or nothing.** `q=isbn:` lands on one printing; a title search lands on whichever printing
 * Google ranks first, which for a much-translated novel is usually the English one. Borrowing that
 * volume's rating for a Ukrainian edition would manufacture precisely the false comparison the
 * feature exists to avoid, so an edition with no ISBN gets no rating and the caller reports the
 * gap.
 */

interface GoogleBooksVolume {
  id: string;
  volumeInfo?: {
    averageRating?: number;
    ratingsCount?: number;
    infoLink?: string;
    canonicalVolumeLink?: string;
  };
}

interface GoogleBooksSearchResponse {
  items?: GoogleBooksVolume[];
}

/**
 * A day. Ratings drift by a decimal over months, not minutes, and the shared Google quota is the
 * real constraint: a popular work's page asks for two dozen editions at once.
 */
const CACHE_TTL_SECONDS = 24 * 60 * 60;

/** What survives a JSON round trip through Redis — `Rating` is rebuilt on read. */
interface CachedRating {
  average: number;
  votes: number;
  outOf: number;
  url: string | null;
}

/**
 * The envelope exists so "Google has no rating for this ISBN" can be cached at all: `CachePort.get`
 * answers `null` for a miss, so a bare stored `null` would be re-fetched on every page load —
 * which is the majority of lookups and the fastest way to burn the daily quota.
 */
interface CachedLookup {
  rating: CachedRating | null;
}

export class GoogleBooksRatingProvider implements EditionRatingProvider {
  readonly id = ProviderId.create('google-books');
  readonly name = 'Google Books';

  constructor(
    private readonly fetcher: ResilientFetcher,
    private readonly cache: CachePort,
    private readonly apiKey?: string,
  ) {}

  async rate(query: RatingQuery): Promise<EditionRatingResult | null> {
    const isbn = query.isbn13 ?? query.isbn10;
    if (!this.apiKey || !isbn) return null;

    const cacheKey = `provider:google-books:rating:${isbn}`;
    const cached = await this.cache.get<CachedLookup>(cacheKey);
    if (cached) return cached.rating ? this.toResult(cached.rating) : null;

    const url = new URL('https://www.googleapis.com/books/v1/volumes');
    url.searchParams.set('q', `isbn:${isbn}`);
    url.searchParams.set('key', this.apiKey);

    const response = await this.fetcher.fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Google Books rating lookup failed with status ${response.status}`);
    }

    const data = (await response.json()) as GoogleBooksSearchResponse;
    const found = this.firstRatedVolume(data.items ?? []);
    // Negative results are cached too, and for just as long: an unrated edition is the normal
    // case, and re-asking Google for every one of them on every page load is how a shared quota
    // dies. `null` is a real answer here, so it is stored as one.
    await this.cache.set<CachedLookup>(cacheKey, { rating: found }, CACHE_TTL_SECONDS);
    return found ? this.toResult(found) : null;
  }

  /**
   * The first volume that states both an average and a count.
   *
   * Both, because Google returns `averageRating` on volumes with no `ratingsCount` at all, and a
   * confident "4.0" under an edition nobody rated is worse than a blank (`Rating` refuses it too).
   */
  private firstRatedVolume(volumes: readonly GoogleBooksVolume[]): CachedRating | null {
    for (const volume of volumes) {
      const info = volume.volumeInfo;
      const average = info?.averageRating;
      const votes = info?.ratingsCount;
      if (typeof average !== 'number' || typeof votes !== 'number' || votes < 1) continue;

      return {
        average,
        votes: Math.trunc(votes),
        // Google's scale is five stars; it publishes no scale field, so this is stated here rather
        // than read from the response.
        outOf: 5,
        url: info?.canonicalVolumeLink ?? info?.infoLink ?? null,
      };
    }
    return null;
  }

  private toResult(cached: CachedRating): EditionRatingResult {
    return {
      providerId: this.id.value,
      providerName: this.name,
      rating: Rating.create(cached.average, cached.votes, cached.outOf),
      url: cached.url,
    };
  }
}
