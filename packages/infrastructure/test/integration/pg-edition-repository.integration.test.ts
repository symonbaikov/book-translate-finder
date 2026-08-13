import { afterAll, beforeAll, beforeEach } from 'vitest';
import { runEditionRepositoryContractTests } from '../../../domain/test/contract/edition-repository.contract-suite.js';
import { work } from '../../src/db/schema.js';
import { PgEditionRepository } from '../../src/repositories/pg-edition-repository.js';
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

runEditionRepositoryContractTests(() => new PgEditionRepository(testDb.db), {
  // Satisfies edition.work_id's foreign key (docs/architecture.md §3.1) — a raw insert is fine
  // here, the row's own field values don't matter to any edition-repository test.
  ensureWorkExists: async (workId) => {
    await testDb.db
      .insert(work)
      .values({
        id: workId,
        originalTitle: 'Placeholder Work',
        originalLanguage: 'en',
        author: 'Placeholder Author',
        firstPublishedYear: null,
        naturalKey: `placeholder-natural-key-${workId}`,
        syncedAt: new Date('2026-01-01T00:00:00Z'),
      })
      .onConflictDoNothing();
  },
});
