import { afterAll, beforeAll, beforeEach } from 'vitest';
import { runIdempotencyStoreContractTests } from '../../../domain/test/contract/idempotency-store.contract-suite.js';
import { PgIdempotencyStore } from '../../src/repositories/pg-idempotency-store.js';
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

runIdempotencyStoreContractTests(() => new PgIdempotencyStore(testDb.db));
