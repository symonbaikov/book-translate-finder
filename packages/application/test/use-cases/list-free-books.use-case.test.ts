import type { FreeBookHit, FreeBooksPort, FreeBooksQuery, FreeBooksResult } from '@golden/domain';
import { describe, expect, it } from 'vitest';
import { InMemoryCache } from '../../../domain/test/fakes/in-memory-cache.js';
import {
  FREE_BOOKS_PAGE_LIMIT,
  ListFreeBooks,
  freeBooksCacheKey,
} from '../../src/use-cases/list-free-books.use-case.js';

class FakeFreeBooks implements FreeBooksPort {
  readonly queries: FreeBooksQuery[] = [];

  constructor(private readonly shelf: FreeBookHit[]) {}

  async listFreeBooks(query: FreeBooksQuery): Promise<FreeBooksResult> {
    this.queries.push(query);
    const matching = query.language
      ? this.shelf.filter((book) => book.id.startsWith(query.language ?? ''))
      : this.shelf;
    return {
      books: matching.slice(query.offset, query.offset + query.limit),
      total: matching.length,
    };
  }
}

function book(id: string): FreeBookHit {
  return {
    id,
    originalTitle: `Title ${id}`,
    author: 'Author',
    firstPublishedYear: 1900,
    coverUrl: null,
    formats: ['epub'],
  };
}

const SHELF = [book('en-1'), book('en-2'), book('ru-1')];

function makeDeps(shelf: FreeBookHit[] = SHELF) {
  const cache = new InMemoryCache();
  const freeBooks = new FakeFreeBooks(shelf);
  return { deps: { cache, freeBooks }, cache, freeBooks };
}

describe('ListFreeBooks', () => {
  it('returns a page of the shelf with the total behind it', async () => {
    const { deps } = makeDeps();

    const result = await new ListFreeBooks(deps).execute({ limit: 2 });

    expect(result.books.map((b) => b.id)).toEqual(['en-1', 'en-2']);
    expect(result.total).toBe(3);
    expect(result.language).toBeNull();
    expect(result.offset).toBe(0);
  });

  it('pages by offset', async () => {
    const { deps } = makeDeps();

    const result = await new ListFreeBooks(deps).execute({ limit: 2, offset: 2 });

    expect(result.books.map((b) => b.id)).toEqual(['ru-1']);
    expect(result.total).toBe(3);
  });

  it('normalizes the language and passes it to the port', async () => {
    const { deps, freeBooks } = makeDeps();

    const result = await new ListFreeBooks(deps).execute({ language: '  RU  ' });

    expect(freeBooks.queries[0]?.language).toBe('ru');
    expect(result.language).toBe('ru');
    expect(result.books.map((b) => b.id)).toEqual(['ru-1']);
  });

  it('treats a blank language as no filter', async () => {
    const { deps, freeBooks } = makeDeps();

    const result = await new ListFreeBooks(deps).execute({ language: '   ' });

    expect(freeBooks.queries[0]?.language).toBeUndefined();
    expect(result.language).toBeNull();
    expect(result.total).toBe(3);
  });

  it('caches per language and page, so a second identical request never reaches the database', async () => {
    const { deps, freeBooks, cache } = makeDeps();
    const useCase = new ListFreeBooks(deps);

    await useCase.execute({ limit: 2 });
    await useCase.execute({ limit: 2 });

    expect(freeBooks.queries).toHaveLength(1);
    expect(await cache.get(freeBooksCacheKey(null, 2, 0))).not.toBeNull();

    // A different page is a different key — otherwise "show more" would serve page one twice.
    await useCase.execute({ limit: 2, offset: 2 });
    expect(freeBooks.queries).toHaveLength(2);
  });

  it('clamps an absurd limit instead of letting a request dump the shelf', async () => {
    const { deps, freeBooks } = makeDeps();

    await new ListFreeBooks(deps).execute({ limit: 5_000 });

    expect(freeBooks.queries[0]?.limit).toBe(60);
  });

  it('falls back to one page when no limit is given', async () => {
    const { deps, freeBooks } = makeDeps();

    await new ListFreeBooks(deps).execute();

    expect(freeBooks.queries[0]?.limit).toBe(FREE_BOOKS_PAGE_LIMIT);
    expect(freeBooks.queries[0]?.offset).toBe(0);
  });

  it('refuses a negative offset rather than asking the database for one', async () => {
    const { deps, freeBooks } = makeDeps();

    await new ListFreeBooks(deps).execute({ offset: -10 });

    expect(freeBooks.queries[0]?.offset).toBe(0);
  });
});
