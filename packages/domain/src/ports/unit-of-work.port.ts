/**
 * The transactional boundary a use case runs its writes inside (docs/rules.md §2.3) — all
 * repository calls made through `work` commit or roll back together, so a sync job can never
 * leave the database in a partially-applied state. The in-memory fake (Phase 1.1) just calls
 * `work()` directly, since fakes have no real transaction to roll back; the real guarantee is
 * only meaningfully tested against Postgres in Phase 1.2's integration tests.
 */
export interface UnitOfWork {
  runInTransaction<T>(work: () => Promise<T>): Promise<T>;
}
