import { AsyncLocalStorage } from 'node:async_hooks';
import type { Queryable } from './client.js';

const storage = new AsyncLocalStorage<Queryable>();

/**
 * What a repository should actually query against: the ambient transaction if
 * `PgUnitOfWork.runInTransaction` is currently active on this async execution context, otherwise
 * `fallback` (the repository's own pool-backed `Db`). This is what lets repositories be
 * constructed once at boot with a plain `Db` and still transparently participate in a
 * transaction when a use case runs them inside `runInTransaction` — no special
 * "transactional repository" variant needed.
 */
export function resolveDb(fallback: Queryable): Queryable {
  return storage.getStore() ?? fallback;
}

export function runWithTransactionContext<T>(tx: Queryable, fn: () => Promise<T>): Promise<T> {
  return storage.run(tx, fn);
}
