import { afterAll, beforeAll, beforeEach } from 'vitest';
import { runSourceLinkRepositoryContractTests } from '../../../domain/test/contract/source-link-repository.contract-suite.js';
import { edition, work } from '../../src/db/schema.js';
import { PgSourceLinkRepository } from '../../src/repositories/pg-source-link-repository.js';
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

runSourceLinkRepositoryContractTests(() => new PgSourceLinkRepository(testDb.db), {
  // Satisfies source_link.edition_id's foreign key, which transitively needs a work row too
  // (docs/architecture.md §3.1). Raw inserts — field values beyond the ids don't matter here.
  ensureEditionExists: async (editionId) => {
    await testDb.db
      .insert(work)
      .values({
        id: 'work-1',
        originalTitle: 'Placeholder Work',
        originalLanguage: 'en',
        author: 'Placeholder Author',
        firstPublishedYear: null,
        naturalKey: 'placeholder-natural-key-work-1',
        syncedAt: new Date('2026-01-01T00:00:00Z'),
      })
      .onConflictDoNothing();

    await testDb.db
      .insert(edition)
      .values({
        id: editionId,
        workId: 'work-1',
        title: 'Placeholder Edition',
        language: 'en',
        naturalKey: `placeholder-natural-key-${editionId}`,
      })
      .onConflictDoNothing();
  },
});
