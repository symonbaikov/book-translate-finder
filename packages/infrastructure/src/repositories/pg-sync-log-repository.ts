import type { SyncLogEntry, SyncLogRepository } from '@golden/domain';
import type { Db } from '../db/client.js';
import { resolveDb } from '../db/transaction-context.js';
import { syncLog } from '../db/schema.js';

/** Append-only (docs/architecture.md §3.1) — a plain INSERT, no upsert target, is correct here. */
export class PgSyncLogRepository implements SyncLogRepository {
  constructor(private readonly db: Db) {}

  /** Resolves to the ambient transaction if PgUnitOfWork.runInTransaction is active, else the pool. */
  private get q() {
    return resolveDb(this.db);
  }

  async record(entry: SyncLogEntry): Promise<void> {
    await this.q.insert(syncLog).values({
      id: entry.id,
      sourceName: entry.sourceName,
      workId: entry.workId,
      jobId: entry.jobId,
      fetchedAt: entry.fetchedAt,
      status: entry.status,
      error: entry.error,
    });
  }
}
