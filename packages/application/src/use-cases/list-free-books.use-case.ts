import type { CachePort, FreeBookHit, FreeBooksPort } from '@golden/domain';
import type { UseCase } from '../use-case.js';
import { CACHE_KEY_VERSION } from '../cache-key-version.js';

/**
 * Shorter than the genre pages' fifteen minutes on purpose: this shelf grows every time a sync
 * lands a public domain download, and a reader who came back after a backfill should see it.
 */
const FREE_BOOKS_TTL_SECONDS = 5 * 60;
/** One row of covers on the home page. */
export const FREE_BOOKS_HOME_LIMIT = 12;
/** One page of the catalogue. Also the ceiling per request — the shelf pages, it does not dump. */
export const FREE_BOOKS_PAGE_LIMIT = 24;
const MAX_LIMIT = 60;

export interface ListFreeBooksInput {
  /** The reader's book language, when they have chosen one. */
  language?: string | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

export interface ListFreeBooksOutput {
  books: FreeBookHit[];
  /** Every free book this instance knows in this language — what a page is a page of. */
  total: number;
  /** The language actually applied, or null when the shelf is unfiltered. */
  language: string | null;
  limit: number;
  offset: number;
}

export interface ListFreeBooksDeps {
  freeBooks: FreeBooksPort;
  cache: CachePort;
}

export function freeBooksCacheKey(language: string | null, limit: number, offset: number): string {
  return `${CACHE_KEY_VERSION}:free-books:${language ?? ''}:${limit}:${offset}`;
}

/**
 * The free shelf: everything this instance can hand a reader directly, newest sync included.
 *
 * No backfill, unlike the genre pages and the home page's curated lists. "Books that are free" is
 * not a question any source answers — Gutenberg has a catalogue, Open Library has borrowable
 * scans, and neither is *the* list — so there is nothing honest to go and fetch. This shelf is
 * therefore a view of what the instance has already collected through ordinary syncs, and on a
 * fresh install it is short and says so rather than pretending to be filling.
 *
 * It also never widens what counts as free: the port filters on the `isLegalFree` flag that
 * `LinkPolicy` set at write time (docs/legal-policy.md I-1), and neither this use case nor the
 * page above it can add to the shelf.
 */
export class ListFreeBooks implements UseCase<ListFreeBooksInput, ListFreeBooksOutput> {
  constructor(private readonly deps: ListFreeBooksDeps) {}

  async execute(input: ListFreeBooksInput = {}): Promise<ListFreeBooksOutput> {
    const language = input.language?.trim().toLowerCase() || null;
    const limit = clamp(input.limit ?? FREE_BOOKS_PAGE_LIMIT, 1, MAX_LIMIT);
    const offset = Math.max(0, Math.trunc(input.offset ?? 0));

    const key = freeBooksCacheKey(language, limit, offset);
    const cached = await this.deps.cache.get<ListFreeBooksOutput>(key);
    if (cached) return cached;

    const { books, total } = await this.deps.freeBooks.listFreeBooks({
      ...(language ? { language } : {}),
      limit,
      offset,
    });

    const output: ListFreeBooksOutput = { books, total, language, limit, offset };
    await this.deps.cache.set(key, output, FREE_BOOKS_TTL_SECONDS);
    return output;
  }
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.trunc(value)));
}
