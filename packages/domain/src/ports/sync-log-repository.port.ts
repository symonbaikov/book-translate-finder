export interface SyncLogEntry {
  id: string;
  sourceName: string;
  workId: string | null;
  jobId: string | null;
  fetchedAt: Date;
  status: 'ok' | 'error';
  error: string | null;
}

/** Append-only audit trail of sync attempts (docs/architecture.md §3.1) — never updated, only recorded. */
export interface SyncLogRepository {
  record(entry: SyncLogEntry): Promise<void>;
}
