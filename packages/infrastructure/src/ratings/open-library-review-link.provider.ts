import {
  ProviderId,
  type CachePort,
  type EditionReviewLink,
  type EditionReviewsProvider,
  type ReviewLinkQuery,
} from '@golden/domain';
import type { ResilientFetcher } from '../http/resilient-fetch.js';

/**
 * Reviews of one printing, found without an API key.
 *
 * Open Library's `api/books?bibkeys=` answers for many ISBNs at once, needs no key, and carries an
 * `identifiers` block naming the same edition on other sites. One of those identifiers is a
 * Goodreads book id — which is what makes this worth having: Goodreads closed its API in December
 * 2020, but an *id* is not an API, and a link built from one costs nobody a request.
 *
 * **Goodreads only, and the exclusion is the interesting part.** Open Library also carries
 * `librarything`, and it is a *work* id: both Spanish and French printings of `Le Petit Prince`
 * in a live sample came back as `11883`. A link that lands on the same page under every
 * translation is precisely the thing this feature exists not to do, so LibraryThing is left out
 * rather than shipped as a near-miss. Goodreads ids do vary per printing in the same sample.
 *
 * **Coverage, measured, not assumed:** 21 of 120 real translated editions from this project's own
 * database carried a Goodreads id (17%); 110 of the 120 were known to Open Library at all. An
 * edition without one gets no link — never a link to a different printing.
 *
 * The URL is *built here* from a digits-only id, never taken from the response. A source that one
 * day writes an absolute URL into that field cannot turn it into a link on this page.
 */

interface OpenLibraryBibkeyEntry {
  identifiers?: Record<string, string[] | undefined>;
}

const PROVIDER_NAME = 'Goodreads';

/** A day: an edition's Goodreads id is set once and never moves. */
const CACHE_TTL_SECONDS = 24 * 60 * 60;

/**
 * How many ISBNs go in one request. Open Library accepts long `bibkeys` lists, but a URL that
 * grows without bound is how a working call becomes a 414 on somebody else's proxy.
 */
const BATCH_SIZE = 40;

/** Cached per ISBN so a page reload, or another work sharing a printing, costs nothing. */
interface CachedLookup {
  goodreadsId: string | null;
}

export class OpenLibraryReviewLinkProvider implements EditionReviewsProvider {
  readonly id = ProviderId.create('goodreads');
  readonly name = PROVIDER_NAME;

  constructor(
    private readonly fetcher: ResilientFetcher,
    private readonly cache: CachePort,
    private readonly userAgent: string,
  ) {}

  async findLinks(queries: readonly ReviewLinkQuery[]): Promise<readonly EditionReviewLink[]> {
    const askable = queries.flatMap((query) => {
      const isbn = query.isbn13 ?? query.isbn10;
      return isbn ? [{ editionId: query.editionId, isbn }] : [];
    });
    if (askable.length === 0) return [];

    const links: EditionReviewLink[] = [];
    const unknown: typeof askable = [];

    for (const entry of askable) {
      const cached = await this.cache.get<CachedLookup>(cacheKey(entry.isbn));
      if (!cached) {
        unknown.push(entry);
        continue;
      }
      if (cached.goodreadsId) links.push(this.toLink(entry.editionId, cached.goodreadsId));
    }

    for (let index = 0; index < unknown.length; index += BATCH_SIZE) {
      const batch = unknown.slice(index, index + BATCH_SIZE);
      const found = await this.fetchBatch(batch.map((entry) => entry.isbn));

      for (const entry of batch) {
        const goodreadsId = found.get(entry.isbn) ?? null;
        // Negative answers are cached as well: most editions have no Goodreads id, and re-asking
        // for all of them on every page load is how a courteous keyless client stops being one.
        await this.cache.set<CachedLookup>(
          cacheKey(entry.isbn),
          { goodreadsId },
          CACHE_TTL_SECONDS,
        );
        if (goodreadsId) links.push(this.toLink(entry.editionId, goodreadsId));
      }
    }

    return links;
  }

  private async fetchBatch(isbns: readonly string[]): Promise<Map<string, string>> {
    const url = new URL('https://openlibrary.org/api/books');
    url.searchParams.set('bibkeys', isbns.map((isbn) => `ISBN:${isbn}`).join(','));
    url.searchParams.set('format', 'json');
    url.searchParams.set('jscmd', 'data');

    const response = await this.fetcher.fetch(url.toString(), {
      // Open Library asks keyless clients to identify themselves; an anonymous batch caller is
      // exactly the traffic they throttle first.
      headers: { 'User-Agent': this.userAgent },
    });
    if (!response.ok) {
      throw new Error(`Open Library identifier lookup failed with status ${response.status}`);
    }

    const data = (await response.json()) as Record<string, OpenLibraryBibkeyEntry>;
    const byIsbn = new Map<string, string>();

    for (const [bibkey, entry] of Object.entries(data)) {
      const isbn = bibkey.startsWith('ISBN:') ? bibkey.slice('ISBN:'.length) : null;
      const id = entry.identifiers?.goodreads?.[0];
      // Digits only. This id is interpolated into a URL, and a source is not a place to trust.
      if (isbn && id && /^\d+$/.test(id)) byIsbn.set(isbn, id);
    }

    return byIsbn;
  }

  private toLink(editionId: string, goodreadsId: string): EditionReviewLink {
    return {
      editionId,
      providerId: this.id.value,
      providerName: PROVIDER_NAME,
      url: `https://www.goodreads.com/book/show/${goodreadsId}`,
    };
  }
}

function cacheKey(isbn: string): string {
  return `provider:open-library:goodreads-id:${isbn}`;
}
