import type { UnitOfWork } from '../../src/ports/unit-of-work.port.js';

/**
 * Just calls `work()` directly — a fake has no real transaction to roll back
 * (see the doc comment on `UnitOfWork`, docs/architecture.md §2.2). Real atomicity is only
 * meaningfully tested against Postgres (packages/infrastructure's integration tests).
 */
export class InMemoryUnitOfWork implements UnitOfWork {
  async runInTransaction<T>(work: () => Promise<T>): Promise<T> {
    return work();
  }
}
