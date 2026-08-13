import { LanguageCode, Work } from '@btf/domain';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { PgWorkRepository } from '../../src/repositories/pg-work-repository.js';
import { PgWorkSearchAdapter } from '../../src/repositories/pg-work-search-adapter.js';
import { setupTestDb, teardownTestDb, type TestDb } from './setup-test-db.js';

describe('PgWorkSearchAdapter (real Postgres, pg_trgm)', () => {
  let testDb: TestDb;
  let repo: PgWorkRepository;
  let search: PgWorkSearchAdapter;

  beforeAll(async () => {
    testDb = await setupTestDb();
    repo = new PgWorkRepository(testDb.db);
    search = new PgWorkSearchAdapter(testDb.db);
  });

  afterAll(async () => {
    await teardownTestDb(testDb);
  });

  beforeEach(async () => {
    await testDb.truncateAll();
  });

  async function seed(id: string, title: string, author: string, year: number): Promise<void> {
    await repo.save(
      Work.create({
        id,
        originalTitle: title,
        originalLanguage: LanguageCode.create('ru'),
        author,
        firstPublishedYear: year,
        syncedAt: new Date('2026-01-01T00:00:00Z'),
      }),
    );
  }

  it('finds a work by an exact title match', async () => {
    await seed('work-1', 'War and Peace', 'Leo Tolstoy', 1869);
    await seed('work-2', 'Anna Karenina', 'Leo Tolstoy', 1877);

    const results = await search.search('War and Peace', 10);

    expect(results.map((r) => r.id)).toContain('work-1');
    expect(results[0]?.originalTitle).toBe('War and Peace');
  });

  it('finds a work by a misspelled title via trigram similarity', async () => {
    await seed('work-1', 'War and Peace', 'Leo Tolstoy', 1869);

    const results = await search.search('War an Piece', 10);

    expect(results.map((r) => r.id)).toContain('work-1');
  });

  it('finds a work by author name', async () => {
    await seed('work-1', 'War and Peace', 'Leo Tolstoy', 1869);

    const results = await search.search('Tolstoy', 10);

    expect(results.map((r) => r.id)).toContain('work-1');
  });

  it('ranks a closer match above a looser one', async () => {
    await seed('work-1', 'War and Peace', 'Leo Tolstoy', 1869);
    await seed('work-2', 'War and Remembrance', 'Herman Wouk', 1978);

    const results = await search.search('War and Peace', 10);

    expect(results[0]?.id).toBe('work-1');
  });

  it('returns an empty array when nothing matches (the lazy-backfill trigger case)', async () => {
    await seed('work-1', 'War and Peace', 'Leo Tolstoy', 1869);

    const results = await search.search('Nonexistent Made Up Title Xyz', 10);

    expect(results).toEqual([]);
  });

  it('does not match on a shared common word alone (found live: 0.1 threshold matched "The Hobbit" for a "The Little Prince" query at similarity 0.1025, purely from "The")', async () => {
    await seed('work-1', 'The Hobbit', 'J.R.R. Tolkien', 1937);

    const results = await search.search('The Little Prince Saint-Exupery', 10);

    expect(results).toEqual([]);
  });

  it('respects the limit', async () => {
    await seed('work-1', 'War and Peace', 'Leo Tolstoy', 1869);
    await seed('work-2', 'War and Peace Study Guide', 'Leo Tolstoy', 1990);
    await seed('work-3', 'War and Peace Companion', 'Leo Tolstoy', 1995);

    const results = await search.search('War and Peace', 2);

    expect(results).toHaveLength(2);
  });
});
