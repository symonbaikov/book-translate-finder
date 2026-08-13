import { afterAll, beforeAll, beforeEach } from 'vitest';
import { runExternalRefRepositoryContractTests } from '../../../domain/test/contract/external-ref-repository.contract-suite.js';
import { PgExternalRefRepository } from '../../src/repositories/pg-external-ref-repository.js';
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

runExternalRefRepositoryContractTests(() => new PgExternalRefRepository(testDb.db));
