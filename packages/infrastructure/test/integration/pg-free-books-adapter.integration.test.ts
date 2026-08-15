import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { edition, sourceLink, work } from '../../src/db/schema.js';
import { PgFreeBooksAdapter } from '../../src/repositories/pg-free-books-adapter.js';
import { setupTestDb, teardownTestDb, type TestDb } from './setup-test-db.js';

let testDb: TestDb;

beforeAll(async () => {
  testDb = await setupTestDb();
});

afterAll(async () => {
  await teardownTestDb(testDb);
});

beforeEach(async () => {
  await testDb.truncateAll();
});

let sequence = 0;

async function givenWork(id: string, title: string, year: number | null): Promise<void> {
  await testDb.db.insert(work).values({
    id,
    originalTitle: title,
    originalLanguage: 'en',
    author: `Author of ${title}`,
    firstPublishedYear: year,
    naturalKey: `nk-${id}`,
    syncedAt: new Date('2026-01-01T00:00:00Z'),
  });
}

async function givenEdition(id: string, workId: string, language: string): Promise<void> {
  await testDb.db.insert(edition).values({
    id,
    workId,
    title: `Edition ${id}`,
    language,
    naturalKey: `nk-${id}`,
  });
}

async function givenLink(options: {
  editionId: string;
  type: 'download' | 'buy' | 'borrow' | 'listen';
  isLegalFree: boolean;
  format?: string | null;
}): Promise<void> {
  sequence += 1;
  await testDb.db.insert(sourceLink).values({
    id: `link-${sequence}`,
    editionId: options.editionId,
    type: options.type,
    url: `https://example.org/${sequence}`,
    urlHash: `hash-${sequence}`,
    provider: 'gutenberg',
    rightsStatus: options.isLegalFree ? 'public_domain' : 'copyrighted',
    isLegalFree: options.isLegalFree,
    format: options.format ?? null,
    verifiedAt: new Date('2026-01-01T00:00:00Z'),
  });
}

describe('PgFreeBooksAdapter', () => {
  it('lists only works that have a legally free link', async () => {
    await givenWork('w-free', 'Free Book', 1900);
    await givenEdition('e-free', 'w-free', 'en');
    await givenLink({ editionId: 'e-free', type: 'download', isLegalFree: true, format: 'epub' });

    await givenWork('w-paid', 'Paid Book', 1990);
    await givenEdition('e-paid', 'w-paid', 'en');
    await givenLink({ editionId: 'e-paid', type: 'buy', isLegalFree: false });

    const result = await new PgFreeBooksAdapter(testDb.db).listFreeBooks({ limit: 10, offset: 0 });

    expect(result.books.map((b) => b.id)).toEqual(['w-free']);
    expect(result.total).toBe(1);
  });

  it('leaves out a work whose only free link is a borrow', async () => {
    // `is_legal_free` follows from rights status, so a public domain scan in a library queue
    // carries it — and a shelf headed "free to read right now" must not include a waiting list.
    await givenWork('w-borrow', 'Borrowable Scan', 1920);
    await givenEdition('e-borrow', 'w-borrow', 'en');
    await givenLink({ editionId: 'e-borrow', type: 'borrow', isLegalFree: true });

    const result = await new PgFreeBooksAdapter(testDb.db).listFreeBooks({ limit: 10, offset: 0 });

    expect(result).toEqual({ books: [], total: 0 });
  });

  it('counts a free audiobook as a copy the reader can have', async () => {
    await givenWork('w-audio', 'Read Aloud', 1813);
    await givenEdition('e-audio', 'w-audio', 'en');
    await givenLink({ editionId: 'e-audio', type: 'listen', isLegalFree: true, format: 'mp3' });

    const result = await new PgFreeBooksAdapter(testDb.db).listFreeBooks({ limit: 10, offset: 0 });

    expect(result.books.map((b) => b.id)).toEqual(['w-audio']);
    expect(result.books[0]?.formats).toEqual(['mp3']);
  });

  it('returns a work once however many free links it has, with its formats collected', async () => {
    await givenWork('w-1', 'Much Reprinted', 1869);
    await givenEdition('e-1', 'w-1', 'en');
    await givenEdition('e-2', 'w-1', 'ru');
    await givenLink({ editionId: 'e-1', type: 'download', isLegalFree: true, format: 'EPUB' });
    await givenLink({ editionId: 'e-1', type: 'download', isLegalFree: true, format: 'txt' });
    await givenLink({ editionId: 'e-2', type: 'download', isLegalFree: true, format: 'epub' });

    const result = await new PgFreeBooksAdapter(testDb.db).listFreeBooks({ limit: 10, offset: 0 });

    expect(result.books).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.books[0]?.formats).toEqual(['epub', 'txt']);
  });

  it('drops the null formats a link without a file legitimately has', async () => {
    await givenWork('w-1', 'Read Online', 1890);
    await givenEdition('e-1', 'w-1', 'en');
    await givenLink({ editionId: 'e-1', type: 'download', isLegalFree: true, format: null });

    const result = await new PgFreeBooksAdapter(testDb.db).listFreeBooks({ limit: 10, offset: 0 });

    expect(result.books[0]?.formats).toEqual([]);
  });

  it('filters on the language of the free edition, not of any edition the work has', async () => {
    await givenWork('w-1', 'Free In English Only', 1900);
    await givenEdition('e-en', 'w-1', 'en');
    await givenEdition('e-ru', 'w-1', 'ru');
    await givenLink({ editionId: 'e-en', type: 'download', isLegalFree: true, format: 'epub' });
    await givenLink({ editionId: 'e-ru', type: 'buy', isLegalFree: false });

    const adapter = new PgFreeBooksAdapter(testDb.db);

    expect((await adapter.listFreeBooks({ language: 'en', limit: 10, offset: 0 })).total).toBe(1);
    expect((await adapter.listFreeBooks({ language: 'ru', limit: 10, offset: 0 })).books).toEqual(
      [],
    );
  });

  it('pages without repeating or skipping a book, and reports the full total on every page', async () => {
    // Same edition count and no year on purpose: the ordering must still be total, or OFFSET
    // paging silently shows some books twice and hides others.
    for (const id of ['w-a', 'w-b', 'w-c']) {
      await givenWork(id, `Book ${id}`, null);
      await givenEdition(`e-${id}`, id, 'en');
      await givenLink({
        editionId: `e-${id}`,
        type: 'download',
        isLegalFree: true,
        format: 'epub',
      });
    }

    const adapter = new PgFreeBooksAdapter(testDb.db);
    const first = await adapter.listFreeBooks({ limit: 2, offset: 0 });
    const second = await adapter.listFreeBooks({ limit: 2, offset: 2 });

    expect(first.total).toBe(3);
    expect(second.total).toBe(3);
    expect([...first.books, ...second.books].map((b) => b.id)).toEqual(['w-a', 'w-b', 'w-c']);
  });

  it('orders the most-published book first', async () => {
    await givenWork('w-one-edition', 'Rarely Printed', 1900);
    await givenEdition('e-1', 'w-one-edition', 'en');
    await givenLink({ editionId: 'e-1', type: 'download', isLegalFree: true, format: 'epub' });

    await givenWork('w-many-editions', 'Often Printed', 1900);
    await givenEdition('e-2', 'w-many-editions', 'en');
    await givenEdition('e-3', 'w-many-editions', 'de');
    await givenLink({ editionId: 'e-2', type: 'download', isLegalFree: true, format: 'epub' });

    const result = await new PgFreeBooksAdapter(testDb.db).listFreeBooks({ limit: 10, offset: 0 });

    expect(result.books.map((b) => b.id)).toEqual(['w-many-editions', 'w-one-edition']);
  });

  it('answers an empty shelf with zero rather than failing', async () => {
    const result = await new PgFreeBooksAdapter(testDb.db).listFreeBooks({ limit: 10, offset: 0 });

    expect(result).toEqual({ books: [], total: 0 });
  });
});
