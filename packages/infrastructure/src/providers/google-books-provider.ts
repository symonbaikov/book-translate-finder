import type {
  BookMetadataProvider,
  CachePort,
  ProviderEdition,
  ProviderWork,
  SearchQuery,
} from '@btf/domain';
import { ProviderId } from '@btf/domain';
import type { ResilientFetcher } from '../http/resilient-fetch.js';

const SEARCH_CACHE_TTL_SECONDS = 60 * 60; // 1h
const VOLUME_CACHE_TTL_SECONDS = 6 * 60 * 60; // 6h

interface GoogleBooksVolume {
  id: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    language?: string;
    publishedDate?: string;
    publisher?: string;
    industryIdentifiers?: { type: string; identifier: string }[];
  };
  saleInfo?: { saleability?: string; buyLink?: string };
}

interface GoogleBooksSearchResponse {
  items?: GoogleBooksVolume[];
}

function extractYear(publishedDate: string | undefined): number | null {
  if (!publishedDate) return null;
  const match = /^(\d{4})/.exec(publishedDate);
  return match ? Number(match[1]) : null;
}

function findIsbn(volume: GoogleBooksVolume, type: 'ISBN_13' | 'ISBN_10'): string | null {
  return volume.volumeInfo?.industryIdentifiers?.find((i) => i.type === type)?.identifier ?? null;
}

/**
 * Google Books has no "work" grouping the way Open Library does — every search result is
 * already a specific edition/listing (its own volume id), not a work with many translations
 * under it. So `searchWorks` maps each item into a one-edition-implied `ProviderWork` (mainly to
 * surface its `externalId`), and `fetchEditions` re-fetches that exact volume and returns it as
 * a single-item list. This matches Google Books' actual role in docs/architecture.md §5 —
 * secondary source for ISBN and purchase links, not primary language/edition discovery.
 */
function mapVolumeToProviderWork(volume: GoogleBooksVolume): ProviderWork {
  const info = volume.volumeInfo ?? {};
  return {
    externalId: volume.id,
    title: info.title ?? '',
    authorNames: info.authors ?? [],
    languages: info.language ? [info.language] : [],
    firstPublishedYear: extractYear(info.publishedDate),
    editionCount: 1,
  };
}

function mapVolumeToProviderEdition(volume: GoogleBooksVolume): ProviderEdition {
  const info = volume.volumeInfo ?? {};
  const buyLink = volume.saleInfo?.buyLink;
  const isForSale = volume.saleInfo?.saleability === 'FOR_SALE' && Boolean(buyLink);

  return {
    externalId: volume.id,
    title: info.title ?? '',
    language: info.language ?? 'und',
    // Google Books doesn't expose a distinct translator credit field.
    translator: null,
    translatedFrom: null,
    publisher: info.publisher ?? null,
    year: extractYear(info.publishedDate),
    isbn13: findIsbn(volume, 'ISBN_13'),
    isbn10: findIsbn(volume, 'ISBN_10'),
    // No reliable public-domain signal in Google Books' API either — 'unknown' is honest, not a
    // guess (docs/legal-policy.md §3).
    rightsSignal: 'unknown',
    // `exactOptionalPropertyTypes` forbids `link: undefined` explicitly — the key must be
    // absent, not present-with-undefined, when there's no sale link.
    ...(isForSale ? { link: { type: 'buy' as const, url: buyLink! } } : {}),
  };
}

/**
 * docs/architecture.md §2.2 `BookMetadataProvider` implementation for Google Books. Unlike
 * Open Library, this could not be live-verified end to end in this environment — Phase 0
 * research found the anonymous API quota already exhausted before any real search could run
 * (docs/research/coverage-phase0.md) — so correctness here rests on unit tests against a
 * hand-built representative response (Google Books' documented shape), not a captured real one.
 * Verify against a real key before relying on this in production.
 */
export class GoogleBooksProvider implements BookMetadataProvider {
  readonly id = ProviderId.create('google-books');

  constructor(
    private readonly fetcher: ResilientFetcher,
    private readonly cache: CachePort,
    private readonly apiKey?: string,
  ) {}

  private withKey(url: URL): URL {
    if (this.apiKey) url.searchParams.set('key', this.apiKey);
    return url;
  }

  async searchWorks(query: SearchQuery): Promise<ProviderWork[]> {
    const cacheKey = `provider:google-books:search:${encodeURIComponent(query.text.trim().toLowerCase())}:${query.limit ?? 5}`;
    const cached = await this.cache.get<ProviderWork[]>(cacheKey);
    if (cached) return cached;

    const url = this.withKey(new URL('https://www.googleapis.com/books/v1/volumes'));
    url.searchParams.set('q', query.text);
    url.searchParams.set('maxResults', String(query.limit ?? 5));

    const res = await this.fetcher.fetch(url.toString());
    if (!res.ok) throw new Error(`Google Books search failed with status ${res.status}`);

    const data = (await res.json()) as GoogleBooksSearchResponse;
    const results = (data.items ?? []).map(mapVolumeToProviderWork);

    await this.cache.set(cacheKey, results, SEARCH_CACHE_TTL_SECONDS);
    return results;
  }

  async fetchEditions(externalWorkId: string): Promise<ProviderEdition[]> {
    const cacheKey = `provider:google-books:volume:${externalWorkId}`;
    const cached = await this.cache.get<ProviderEdition[]>(cacheKey);
    if (cached) return cached;

    const url = this.withKey(
      new URL(`https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(externalWorkId)}`),
    );

    const res = await this.fetcher.fetch(url.toString());
    if (!res.ok) throw new Error(`Google Books volume fetch failed with status ${res.status}`);

    const volume = (await res.json()) as GoogleBooksVolume;
    const results = [mapVolumeToProviderEdition(volume)];

    await this.cache.set(cacheKey, results, VOLUME_CACHE_TTL_SECONDS);
    return results;
  }
}
