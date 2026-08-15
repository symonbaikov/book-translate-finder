import { Edition, LanguageCode, Work } from '@golden/domain';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { PgEditionRepository } from '../../src/repositories/pg-edition-repository.js';
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

  it('finds a work by a translated edition title when the original title is in another language', async () => {
    // Found live in Phase 3: «Мастер и Маргарита» (the stored original title) was unfindable by
    // the English title its own translations carry, and the backfill deduplicated into the same
    // work — a cross-language dead loop. Edition titles must be a search arm of their own.
    await seed('work-1', 'Мастер и Маргарита', 'Михаил Афанасьевич Булгаков', 1966);
    const editionRepo = new PgEditionRepository(testDb.db);
    await editionRepo.save(
      Edition.create({
        id: 'edition-1',
        workId: 'work-1',
        title: 'The Master and Margarita',
        language: LanguageCode.create('en'),
        publisher: 'Penguin',
        year: 2000,
      }),
    );

    const results = await search.search('Master and Margarita', 10);

    expect(results.map((r) => r.id)).toContain('work-1');
    expect(results[0]?.originalTitle).toBe('Мастер и Маргарита');
  });

  it('ranks the book that matches title and author above one matching the author alone', async () => {
    // Found live: «Шантарам Грегори Дэвид Робертс» returned *The Mountain Shadow* — a different
    // novel by the same author. Scoring each arm separately and taking the maximum meant the
    // author's name scored identically for both books, so the two tied and the order between
    // them was arbitrary. The reader had named the title too, and that has to count.
    await seed('work-shantaram', 'Shantaram', 'Gregory David Roberts', 2003);
    await seed('work-shadow', 'The Mountain Shadow', 'Gregory David Roberts', 2015);

    const results = await search.search('Shantaram Gregory David Roberts', 10);

    expect(results[0]?.id).toBe('work-shantaram');
    expect(results.map((r) => r.id)).toContain('work-shadow');
  });

  it('reports how well each hit answered the query, so a weak best match can be questioned', async () => {
    await seed('work-1', 'War and Peace', 'Leo Tolstoy', 1869);

    const [exact] = await search.search('War and Peace Tolstoy', 10);
    const [loose] = await search.search('Shantaram Gregory David Roberts', 10);

    expect(exact?.rank).toBeGreaterThan(0.55);
    expect(loose === undefined || (loose.rank ?? 1) < 0.55).toBe(true);
  });

  it('does not reach a work through one shared word in an unrelated edition title', async () => {
    // Found live: «Обитель Прилепин» returned *La chartreuse de Parme* by Stendhal, because its
    // Russian edition is «Пармская обитель» and that one shared word scored 0.360 — over the
    // general 0.3 bar — while the work itself scored 0.000 against the query. Reaching a work
    // through an edition title is weaker evidence than matching its own title or author, so that
    // arm carries a higher bar; the matches it exists for clear it easily (1.000 and 0.621 on the
    // two cases either side of this test).
    await seed('work-1', 'La chartreuse de Parme', 'Stendhal', 1839);
    const editionRepo = new PgEditionRepository(testDb.db);
    await editionRepo.save(
      Edition.create({
        id: 'edition-ru',
        workId: 'work-1',
        title: 'Пармская обитель',
        language: LanguageCode.create('ru'),
        publisher: 'Азбука',
        year: 2019,
      }),
    );

    await expect(search.search('Обитель Прилепин', 10)).resolves.toEqual([]);
    // The same edition still finds the book when the reader actually means it.
    const own = await search.search('Пармская обитель', 10);
    expect(own.map((r) => r.id)).toContain('work-1');
  });

  it('finds a romanized-stored work by its Cyrillic query (cross-script fallback)', async () => {
    // Found live in Phase 3: Open Library stores Russian editions romanized ("Voina i mir"), so
    // the Cyrillic query «Война и мир» shares zero trigrams with anything stored — the primary
    // pass finds nothing and the adapter retries with the romanized query.
    await seed('work-1', 'War and Peace', 'Leo Tolstoy', 1869);
    const editionRepo = new PgEditionRepository(testDb.db);
    await editionRepo.save(
      Edition.create({
        id: 'edition-ru',
        workId: 'work-1',
        title: 'Voina i mir',
        language: LanguageCode.create('ru'),
        publisher: 'Nauka',
        year: 1965,
      }),
    );

    const results = await search.search('Война и мир', 10);

    expect(results.map((r) => r.id)).toContain('work-1');
  });

  it('merges Cyrillic and Latin-titled works of the same series into one result set', async () => {
    // Found live: «Метро 2033»/«Метро 2034» are stored in Cyrillic, "Metro 2035" is stored in
    // Latin (synced later under its own spelling). A query for «Метро» alone already matched the
    // two Cyrillic works, so the old early-return never even tried the romanized fallback pass —
    // "Metro 2035" was invisible to a query for the series name.
    await seed('work-2033', 'Метро 2033', 'Дмитрий Глуховский', 2007);
    await seed('work-2034', 'Метро 2034', 'Дмитрий Глуховский', 2009);
    await seed('work-2035', 'Metro 2035', 'Дмитрий Глуховский', 2015);

    const results = await search.search('Метро', 10);

    expect(results.map((r) => r.id)).toEqual(
      expect.arrayContaining(['work-2033', 'work-2034', 'work-2035']),
    );
  });

  it('respects the limit after merging Cyrillic and romanized-fallback results', async () => {
    await seed('work-2033', 'Метро 2033', 'Дмитрий Глуховский', 2007);
    await seed('work-2034', 'Метро 2034', 'Дмитрий Глуховский', 2009);
    await seed('work-2035', 'Metro 2035', 'Дмитрий Глуховский', 2015);

    const results = await search.search('Метро', 2);

    expect(results).toHaveLength(2);
  });
});
