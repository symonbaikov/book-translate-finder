import { LanguageCode, Work } from '@golden/domain';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { PgUnitOfWork } from '../../src/db/pg-unit-of-work.js';
import { PgSyncLogRepository } from '../../src/repositories/pg-sync-log-repository.js';
import { PgWorkRepository } from '../../src/repositories/pg-work-repository.js';
import { setupTestDb, teardownTestDb, type TestDb } from './setup-test-db.js';

/**
 * Proves `PgUnitOfWork` provides REAL cross-repository atomicity (docs/rules.md §2.3), not just
 * "runs a function": two different repositories, constructed independently with the same
 * pool-backed `Db`, must both write through the SAME transaction when called inside
 * `runInTransaction`, and both roll back together on error.
 */
describe('PgUnitOfWork', () => {
  let testDb: TestDb;
  let unitOfWork: PgUnitOfWork;
  let workRepository: PgWorkRepository;
  let syncLogRepository: PgSyncLogRepository;

  beforeAll(async () => {
    testDb = await setupTestDb();
    unitOfWork = new PgUnitOfWork(testDb.db);
    workRepository = new PgWorkRepository(testDb.db);
    syncLogRepository = new PgSyncLogRepository(testDb.db);
  });

  afterAll(async () => {
    await teardownTestDb(testDb);
  });

  beforeEach(async () => {
    await testDb.truncateAll();
  });

  const makeWork = () =>
    Work.create({
      id: 'work-1',
      originalTitle: 'War and Peace',
      originalLanguage: LanguageCode.create('ru'),
      author: 'Leo Tolstoy',
      firstPublishedYear: 1869,
      syncedAt: new Date('2026-01-01T00:00:00Z'),
    });

  it('commits writes from multiple repositories together', async () => {
    await unitOfWork.runInTransaction(async () => {
      await workRepository.save(makeWork());
      await syncLogRepository.record({
        id: 'sync-1',
        sourceName: 'open-library',
        workId: 'work-1',
        jobId: 'job-1',
        fetchedAt: new Date('2026-01-01T00:00:00Z'),
        status: 'ok',
        error: null,
      });
    });

    expect(await workRepository.findById('work-1')).not.toBeNull();
    const rows = await testDb.client`SELECT * FROM sync_log WHERE id = 'sync-1'`;
    expect(rows).toHaveLength(1);
  });

  it('rolls back every repository write when the callback throws', async () => {
    await expect(
      unitOfWork.runInTransaction(async () => {
        await workRepository.save(makeWork());
        await syncLogRepository.record({
          id: 'sync-1',
          sourceName: 'open-library',
          workId: 'work-1',
          jobId: 'job-1',
          fetchedAt: new Date('2026-01-01T00:00:00Z'),
          status: 'ok',
          error: null,
        });
        throw new Error('simulated failure mid-transaction');
      }),
    ).rejects.toThrow('simulated failure mid-transaction');

    // Neither write survived — proof this is real atomicity, not two independent successful
    // writes that happened to run inside a function that later threw.
    expect(await workRepository.findById('work-1')).toBeNull();
    const rows = await testDb.client`SELECT * FROM sync_log WHERE id = 'sync-1'`;
    expect(rows).toHaveLength(0);
  });

  it('writes made outside runInTransaction are unaffected by a later rollback', async () => {
    await syncLogRepository.record({
      id: 'sync-outside',
      sourceName: 'open-library',
      workId: null,
      jobId: null,
      fetchedAt: new Date('2026-01-01T00:00:00Z'),
      status: 'ok',
      error: null,
    });

    await expect(
      unitOfWork.runInTransaction(async () => {
        await workRepository.save(makeWork());
        throw new Error('simulated failure');
      }),
    ).rejects.toThrow();

    const rows = await testDb.client`SELECT * FROM sync_log WHERE id = 'sync-outside'`;
    expect(rows).toHaveLength(1);
  });
});
