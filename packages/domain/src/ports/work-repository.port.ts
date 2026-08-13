import type { Work } from '../entities/work.js';

/**
 * Narrow on purpose (docs/rules.md §1 ISP) — only what the sync flow (ADR-0002) needs today.
 * Full-text search is a Postgres-specific concern (trigram index, docs/architecture.md §3.3)
 * that belongs to a dedicated search port introduced with the `SearchWorks` use case in
 * Phase 1.4, not bolted onto this one pre-emptively.
 */
export interface WorkRepository {
  findByNaturalKey(naturalKey: string): Promise<Work | null>;
  findById(id: string): Promise<Work | null>;
  /** Upsert on `natural_key` (docs/rules.md §2.2) — never a bare insert. */
  save(work: Work): Promise<void>;
  /** Cron `RefreshStaleWorks` (docs/architecture.md §5): oldest-`syncedAt`-first, capped at `limit`. */
  findStale(olderThan: Date, limit: number): Promise<Work[]>;
}
