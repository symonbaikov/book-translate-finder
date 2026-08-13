import type { UnitOfWork } from '@btf/domain';
import type { Db } from './client.js';
import { runWithTransactionContext } from './transaction-context.js';

/**
 * Wraps a real Postgres transaction (`BEGIN`/`COMMIT`/`ROLLBACK` handled by
 * `db.transaction()` — it rolls back automatically if the callback throws). Repository calls
 * made inside `work()` route through the same transactional handle via
 * `runWithTransactionContext` + each repository's `resolveDb()` call, not through the pool —
 * that's what makes this real cross-repository atomicity, not just "runs a function".
 */
export class PgUnitOfWork implements UnitOfWork {
  constructor(private readonly db: Db) {}

  async runInTransaction<T>(work: () => Promise<T>): Promise<T> {
    return this.db.transaction((tx) => runWithTransactionContext(tx, work));
  }
}
