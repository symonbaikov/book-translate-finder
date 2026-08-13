import type { SyncLogEntry, SyncLogRepository } from '@btf/domain';
import type { Db } from '../db/client.js';
import { syncLog } from '../db/schema.js';

/** Append-only (docs/architecture.md §3.1) — a plain INSERT, no upsert target, is correct here. */
export class PgSyncLogRepository implements SyncLogRepository {
  constructor(private readonly db: Db) {}

  async record(entry: SyncLogEntry): Promise<void> {
    await this.db.insert(syncLog).values({
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
