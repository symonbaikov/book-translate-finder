import type {
  BookMetadataProvider,
  ProviderEdition,
  ProviderWork,
  ProviderWorkDetails,
  SearchQuery,
} from '@btf/domain';
import { ProviderId } from '@btf/domain';
import type { CachePort } from '@btf/domain';
import type { ResilientFetcher } from '../http/resilient-fetch.js';

const CACHE_TTL_SECONDS = 6 * 60 * 60;
const LIBRIVOX_BASE = 'https://librivox.org/api/feed/audiobooks';

interface LibriVoxAuthor {
  first_name?: string;
  last_name?: string;
}

interface LibriVoxBook {
  id?: string;
  title?: string;
  authors?: LibriVoxAuthor[];
  language?: string;
  /** A zip of the whole reading, hosted by Internet Archive. */
  url_zip_file?: string;
  /** The book's page on librivox.org — where a reader presses play. */
  url_librivox?: string;
  description?: string;
  totaltime?: string;
}

interface LibriVoxResponse {
  books?: LibriVoxBook[];
}

/**
 * LibriVox names languages in English ("English", "Russian"), not as codes. Only the languages
 * that actually appear in its catalogue are mapped; anything unmapped becomes `und`, which the
 * sync then skips rather than guessing at.
 */
const LANGUAGE_CODES: ReadonlyMap<string, string> = new Map([
  ['english', 'en'],
  ['german', 'de'],
  ['french', 'fr'],
  ['spanish', 'es'],
  ['italian', 'it'],
  ['portuguese', 'pt'],
  ['dutch', 'nl'],
  ['russian', 'ru'],
  ['polish', 'pl'],
  ['swedish', 'sv'],
  ['danish', 'da'],
  ['finnish', 'fi'],
  ['japanese', 'ja'],
  ['chinese', 'zh'],
  ['latin', 'la'],
  ['greek', 'el'],
  ['hebrew', 'he'],
  ['czech', 'cs'],
  ['hungarian', 'hu'],
  ['catalan', 'ca'],
  ['ukrainian', 'uk'],
  ['romanian', 'ro'],
  ['norwegian', 'no'],
  ['turkish', 'tr'],
  ['arabic', 'ar'],
  ['korean', 'ko'],
  ['esperanto', 'eo'],
]);

function languageCode(name: string | undefined): string {
  return LANGUAGE_CODES.get((name ?? '').trim().toLowerCase()) ?? 'und';
}

function authorNames(book: LibriVoxBook): string[] {
  return (book.authors ?? [])
    .map((a) => [a.first_name, a.last_name].filter(Boolean).join(' ').trim())
    .filter((name) => name.length > 0);
}

function toLinks(
  book: LibriVoxBook,
): { type: 'download' | 'listen'; url: string; format: string }[] {
  const links: { type: 'download' | 'listen'; url: string; format: string }[] = [];
  // The zip is a real file the reader keeps; the LibriVox page is where they press play. Both are
  // offered because "download the whole reading" and "listen now" are different intentions.
  if (book.url_zip_file?.startsWith('https://')) {
    links.push({ type: 'download', url: book.url_zip_file, format: 'mp3-zip' });
  }
  if (book.url_librivox?.startsWith('https://')) {
    links.push({ type: 'listen', url: book.url_librivox, format: 'mp3' });
  }
  return links;
}

function mapToWork(book: LibriVoxBook): ProviderWork {
  return {
    externalId: String(book.id ?? ''),
    title: (book.title ?? '').trim(),
    authorNames: authorNames(book),
    languages: [languageCode(book.language)],
    firstPublishedYear: null, // LibriVox dates the recording, not the book.
    editionCount: 1,
    coverUrl: null, // Its cover art is a generated title card, not a real jacket.
  };
}

/**
 * docs/architecture.md §2.2 `BookMetadataProvider` over LibriVox — the audiobook half of the
 * answer.
 *
 * Every LibriVox recording is read by volunteers from a public domain text and released into the
 * public domain by LibriVox's own charter, which is why `librivox` is on `LinkPolicy`'s allowlist
 * (ADR-0005). That also bounds what this provider can ever offer: public domain audiobooks only.
 * No open source lists which commercial audiobooks a reader could buy, so the app does not
 * pretend to answer that (docs/plan.md Phase 4.4).
 *
 * Needs no API key, keeping the self-hosting story key-free (CLAUDE.md).
 */
export class LibriVoxProvider implements BookMetadataProvider {
  readonly id = ProviderId.create('librivox');

  constructor(
    private readonly fetcher: ResilientFetcher,
    private readonly cache: CachePort,
    private readonly userAgent: string,
  ) {}

  async searchWorks(query: SearchQuery): Promise<ProviderWork[]> {
    const books = await this.search(query.text, query.limit ?? 5);
    return books.map(mapToWork).filter((work) => work.title.length > 0);
  }

  async fetchEditions(externalWorkId: string): Promise<ProviderEdition[]> {
    const book = await this.fetchById(externalWorkId);
    if (!book) return [];

    const links = toLinks(book);
    return [
      {
        externalId: externalWorkId,
        title: (book.title ?? '').trim(),
        language: languageCode(book.language),
        coverUrl: null,
        // The reader is credited, not a translator; putting a narrator in the translator field
        // would be a lie the card then displays as fact.
        translator: null,
        translatedFrom: null,
        publisher: 'LibriVox',
        year: null,
        isbn13: null,
        isbn10: null,
        pages: null,
        // What distinguishes this "edition" from a printed one, in the reader's own words.
        binding: book.totaltime ? `Audiobook, ${book.totaltime}` : 'Audiobook',
        rightsSignal: 'public_domain',
        ...(links.length > 0 ? { links } : {}),
      },
    ];
  }

  async fetchWorkDetails(externalWorkId: string): Promise<ProviderWorkDetails> {
    const book = await this.fetchById(externalWorkId);
    // The description belongs to the recording ("Sherry reads Jane Austen…"), not to the book, so
    // it is deliberately not offered — a bibliographic source should win that field.
    return { description: null, coverUrl: null, subjects: [], ...(book ? {} : {}) };
  }

  private async search(text: string, limit: number): Promise<LibriVoxBook[]> {
    const trimmed = text.trim();
    const cacheKey = `provider:librivox:search:${encodeURIComponent(trimmed.toLowerCase())}:${limit}`;
    const cached = await this.cache.get<LibriVoxBook[]>(cacheKey);
    if (cached) return cached;

    // `^` anchors the title match; without it LibriVox matches anywhere in the title and a short
    // query returns a long tail of unrelated collections.
    const url = `${LIBRIVOX_BASE}?${new URLSearchParams({
      title: `^${trimmed}`,
      format: 'json',
      limit: String(limit),
    })}`;
    const res = await this.fetcher.fetch(url, { headers: { 'User-Agent': this.userAgent } });
    if (!res.ok) throw new Error(`LibriVox search failed with status ${res.status}`);

    // LibriVox answers a no-match with `{"error": "..."}` and HTTP 200, not an empty list.
    const data = (await res.json()) as LibriVoxResponse & { error?: string };
    const books = data.error ? [] : (data.books ?? []);

    await this.cache.set(cacheKey, books, CACHE_TTL_SECONDS);
    return books;
  }

  private async fetchById(id: string): Promise<LibriVoxBook | null> {
    const cacheKey = `provider:librivox:book:${id}`;
    const cached = await this.cache.get<LibriVoxBook>(cacheKey);
    if (cached) return cached;

    const url = `${LIBRIVOX_BASE}?${new URLSearchParams({ id, format: 'json' })}`;
    const res = await this.fetcher.fetch(url, { headers: { 'User-Agent': this.userAgent } });
    if (!res.ok) return null;

    const data = (await res.json()) as LibriVoxResponse & { error?: string };
    const book = data.error ? undefined : data.books?.[0];
    if (!book) return null;

    await this.cache.set(cacheKey, book, CACHE_TTL_SECONDS);
    return book;
  }
}
