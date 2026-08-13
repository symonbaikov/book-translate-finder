import { afterAll, beforeAll, beforeEach } from 'vitest';
// Reuses the SAME contract suite the in-memory fake proved itself against in Phase 1.1
// (packages/domain/test/contract) — the whole point of a contract suite is running it against
// every real implementation, not just writing Postgres-specific tests from scratch.
import { runWorkRepositoryContractTests } from '../../../domain/test/contract/work-repository.contract-suite.js';
import { PgWorkRepository } from '../../src/repositories/pg-work-repository.js';
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

runWorkRepositoryContractTests(() => new PgWorkRepository(testDb.db));
