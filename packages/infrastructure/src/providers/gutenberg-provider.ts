import type {
  BookMetadataProvider,
  CachePort,
  ProviderEdition,
  ProviderWork,
  ProviderWorkDetails,
  SearchQuery,
} from '@golden/domain';
import { ProviderId } from '@golden/domain';
import type { ResilientFetcher } from '../http/resilient-fetch.js';

const SEARCH_CACHE_TTL_SECONDS = 6 * 60 * 60;

/** Gutendex — an open, key-free JSON API over the Project Gutenberg catalog. */
const GUTENDEX_BASE = 'https://gutendex.com';

interface GutendexBook {
  id: number;
  title: string;
  authors?: { name: string }[];
  languages?: string[];
  copyright?: boolean | null;
  formats?: Record<string, string>;
}

interface GutendexResponse {
  results?: GutendexBook[];
}

/**
 * MIME type → the short format label a reader actually recognizes. Only real, downloadable book
 * formats are listed: `application/rdf+xml` is catalog metadata and images are covers, so
 * anything unmapped is deliberately dropped rather than offered as a "download".
 */
const FORMAT_LABELS: ReadonlyMap<string, string> = new Map([
  ['application/epub+zip', 'epub'],
  ['application/x-mobipocket-ebook', 'mobi'],
  ['application/pdf', 'pdf'],
  ['text/plain; charset=utf-8', 'txt'],
  ['text/html', 'html'],
]);

/** Preferred first — an e-reader format beats plain text, which beats reading in a browser. */
const FORMAT_ORDER: readonly string[] = ['epub', 'mobi', 'pdf', 'txt', 'html'];

function toDownloadLinks(book: GutendexBook): { type: 'download'; url: string; format: string }[] {
  const links: { type: 'download'; url: string; format: string }[] = [];
  for (const [mime, url] of Object.entries(book.formats ?? {})) {
    const format = FORMAT_LABELS.get(mime);
    // `.images` variants and plain ones can both appear; one entry per format is enough.
    if (!format || links.some((l) => l.format === format)) continue;
    if (!url.startsWith('https://')) continue;
    links.push({ type: 'download', url, format });
  }
  return links.sort((a, b) => FORMAT_ORDER.indexOf(a.format) - FORMAT_ORDER.indexOf(b.format));
}

function mapBookToWork(book: GutendexBook): ProviderWork {
  return {
    externalId: String(book.id),
    title: book.title,
    authorNames: (book.authors ?? []).map((a) => a.name),
    languages: book.languages ?? [],
    firstPublishedYear: null, // Gutendex exposes no publication year.
    editionCount: 1,
    coverUrl: null,
  };
}

/**
 * docs/architecture.md §2.2 `BookMetadataProvider` over Project Gutenberg (via Gutendex).
 *
 * This is the source that makes "where can I actually download this book" answerable at all.
 * Open Library tells us a scan exists and whether it can be *borrowed*; Gutenberg hands over the
 * file — as EPUB, MOBI, plain text or HTML, so the reader picks a format rather than being told
 * one exists somewhere.
 *
 * It is safe to mark these `public_domain` because that is Project Gutenberg's entire premise,
 * and `gutenberg` is on `LinkPolicy`'s download allowlist (docs/legal-policy.md I-1) for exactly
 * this reason. The one exception the catalog itself flags — `copyright: true`, a work hosted
 * with permission rather than in the public domain — is dropped rather than guessed at, because
 * an unclear rights signal must never be read as permission (docs/legal-policy.md §3).
 *
 * Gutendex needs no API key, which keeps the self-hosting story key-free (CLAUDE.md).
 */
export class GutenbergProvider implements BookMetadataProvider {
  readonly id = ProviderId.create('gutenberg');

  constructor(
    private readonly fetcher: ResilientFetcher,
    private readonly cache: CachePort,
    private readonly userAgent: string,
  ) {}

  async searchWorks(query: SearchQuery): Promise<ProviderWork[]> {
    const books = await this.search(query.text, query.limit ?? 5);
    return books.map(mapBookToWork);
  }

  async fetchEditions(externalWorkId: string): Promise<ProviderEdition[]> {
    const book = await this.fetchBook(externalWorkId);
    if (!book) return [];

    const links = toDownloadLinks(book);
    return [
      {
        externalId: externalWorkId,
        title: book.title,
        language: book.languages?.[0] ?? 'und',
        coverUrl: null,
        // Gutenberg's catalog credits translators inside the title ("… translated by …") rather
        // than in a structured field, and parsing that out of free text would invent data.
        translator: null,
        translatedFrom: null,
        publisher: 'Project Gutenberg',
        year: null,
        isbn13: null,
        isbn10: null,
        rightsSignal: 'public_domain',
        ...(links.length > 0 ? { links } : {}),
      },
    ];
  }

  async fetchWorkDetails(_externalWorkId: string): Promise<ProviderWorkDetails> {
    // Gutendex carries no blurb, and its cover images are generated title pages rather than real
    // jackets — returning nulls lets a higher-priority source supply both (docs/architecture.md §5).
    return { description: null, coverUrl: null };
  }

  private async search(text: string, limit: number): Promise<GutendexBook[]> {
    const cacheKey = `provider:gutenberg:search:${encodeURIComponent(text.trim().toLowerCase())}:${limit}`;
    const cached = await this.cache.get<GutendexBook[]>(cacheKey);
    if (cached) return cached;

    const url = `${GUTENDEX_BASE}/books?${new URLSearchParams({ search: text })}`;
    const res = await this.fetcher.fetch(url, { headers: { 'User-Agent': this.userAgent } });
    if (!res.ok) throw new Error(`Gutenberg search failed with status ${res.status}`);

    const data = (await res.json()) as GutendexResponse;
    // `copyright: true` means Gutenberg hosts it by permission, not as public domain — excluded,
    // since every link this provider produces claims public_domain.
    const results = (data.results ?? []).filter((b) => b.copyright !== true).slice(0, limit);

    await this.cache.set(cacheKey, results, SEARCH_CACHE_TTL_SECONDS);
    return results;
  }

  private async fetchBook(id: string): Promise<GutendexBook | null> {
    const cacheKey = `provider:gutenberg:book:${id}`;
    const cached = await this.cache.get<GutendexBook>(cacheKey);
    if (cached) return cached;

    const url = `${GUTENDEX_BASE}/books/${encodeURIComponent(id)}`;
    const res = await this.fetcher.fetch(url, { headers: { 'User-Agent': this.userAgent } });
    if (!res.ok) return null;

    const book = (await res.json()) as GutendexBook;
    if (book.copyright === true) return null;

    await this.cache.set(cacheKey, book, SEARCH_CACHE_TTL_SECONDS);
    return book;
  }
}
