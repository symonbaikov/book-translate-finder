import type {
  BookMetadataProvider,
  CachePort,
  ProviderEdition,
  ProviderWork,
  SearchQuery,
} from '@btf/domain';
import { ProviderId } from '@btf/domain';
import type { ResilientFetcher } from '../http/resilient-fetch.js';

const SEARCH_CACHE_TTL_SECONDS = 60 * 60; // 1h — matches docs/architecture.md §6 hot-response TTLs
const EDITIONS_CACHE_TTL_SECONDS = 6 * 60 * 60; // 6h — editions change less often than search rankings

interface OpenLibrarySearchDoc {
  key: string;
  title: string;
  author_name?: string[];
  language?: string[];
  edition_count?: number;
  first_publish_year?: number;
}

interface OpenLibrarySearchResponse {
  docs?: OpenLibrarySearchDoc[];
}

interface OpenLibraryEditionEntry {
  key: string;
  title?: string;
  languages?: { key: string }[];
  contributors?: { role?: string; name?: string }[];
  translated_from?: { key: string }[];
  publishers?: string[];
  publish_date?: string;
  isbn_10?: string[];
  isbn_13?: string[];
}

interface OpenLibraryEditionsResponse {
  entries?: OpenLibraryEditionEntry[];
}

function extractYear(publishDate: string | undefined): number | null {
  if (!publishDate) return null;
  const match = /\b(\d{4})\b/.exec(publishDate);
  return match ? Number(match[1]) : null;
}

function extractTranslator(entry: OpenLibraryEditionEntry): string | null {
  // The structured field (docs/research/coverage-phase0.md found this is where it actually
  // lives — a naive text-search over `contributions`/`by_statement` alone missed it entirely).
  const translator = entry.contributors?.find((c) => c.role?.toLowerCase().includes('translat'));
  return translator?.name ?? null;
}

function mapSearchDoc(doc: OpenLibrarySearchDoc): ProviderWork {
  return {
    externalId: doc.key,
    title: doc.title,
    authorNames: doc.author_name ?? [],
    languages: doc.language ?? [],
    firstPublishedYear: doc.first_publish_year ?? null,
    editionCount: doc.edition_count ?? 0,
  };
}

function mapEditionEntry(entry: OpenLibraryEditionEntry): ProviderEdition {
  return {
    externalId: entry.key,
    title: entry.title ?? '',
    language: entry.languages?.[0]?.key.replace('/languages/', '') ?? 'und',
    translator: extractTranslator(entry),
    translatedFrom: entry.translated_from?.[0]?.key.replace('/languages/', '') ?? null,
    publisher: entry.publishers?.[0] ?? null,
    year: extractYear(entry.publish_date),
    isbn13: entry.isbn_13?.[0] ?? null,
    isbn10: entry.isbn_10?.[0] ?? null,
    // Open Library's editions.json has no reliable per-edition public-vs-lending signal (unlike
    // search.json's work-level `ebook_access`, which doesn't tell us about a specific edition) —
    // 'unknown' is the honest answer, not a guess (docs/legal-policy.md §3: absence of a clear
    // signal is never treated as permission). No `link` either, for the same reason.
    rightsSignal: 'unknown',
  };
}

/**
 * docs/architecture.md §2.2 `BookMetadataProvider` implementation for Open Library. Two rules
 * are non-negotiable, both found the hard way in Phase 0 (docs/research/coverage-phase0.md):
 * plain-text search only (field-scoped queries fragment across duplicate records and undercount
 * language coverage by a wide margin), and every request goes through the resilient fetcher
 * (76% of naive sequential requests failed under load without retry/backoff).
 */
export class OpenLibraryProvider implements BookMetadataProvider {
  readonly id = ProviderId.create('open-library');

  constructor(
    private readonly fetcher: ResilientFetcher,
    private readonly cache: CachePort,
    private readonly userAgent: string,
  ) {}

  async searchWorks(query: SearchQuery): Promise<ProviderWork[]> {
    const cacheKey = `provider:open-library:search:${encodeURIComponent(query.text.trim().toLowerCase())}:${query.limit ?? 5}`;
    const cached = await this.cache.get<ProviderWork[]>(cacheKey);
    if (cached) return cached;

    const url = `https://openlibrary.org/search.json?${new URLSearchParams({
      q: query.text,
      fields: 'key,title,author_name,language,edition_count,first_publish_year',
      limit: String(query.limit ?? 5),
    })}`;

    const res = await this.fetcher.fetch(url, { headers: { 'User-Agent': this.userAgent } });
    if (!res.ok) throw new Error(`Open Library search failed with status ${res.status}`);

    const data = (await res.json()) as OpenLibrarySearchResponse;
    const results = (data.docs ?? []).map(mapSearchDoc);

    await this.cache.set(cacheKey, results, SEARCH_CACHE_TTL_SECONDS);
    return results;
  }

  async fetchEditions(externalWorkId: string): Promise<ProviderEdition[]> {
    const cacheKey = `provider:open-library:editions:${externalWorkId}`;
    const cached = await this.cache.get<ProviderEdition[]>(cacheKey);
    if (cached) return cached;

    const url = `https://openlibrary.org${externalWorkId}/editions.json?limit=50`;
    const res = await this.fetcher.fetch(url, { headers: { 'User-Agent': this.userAgent } });
    if (!res.ok) throw new Error(`Open Library editions failed with status ${res.status}`);

    const data = (await res.json()) as OpenLibraryEditionsResponse;
    const results = (data.entries ?? []).map(mapEditionEntry);

    await this.cache.set(cacheKey, results, EDITIONS_CACHE_TTL_SECONDS);
    return results;
  }
}
