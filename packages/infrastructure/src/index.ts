// Phase 1.2: adds the Postgres client factory, schema, and repository adapters for the
// idempotency-critical ports. `PgUnitOfWork` is deliberately NOT implemented yet — a naive
// wrapper around `db.transaction()` that doesn't also route repository calls through the same
// transaction handle would silently fail to provide the atomicity docs/rules.md §2.3 promises.
// That needs a transaction-context mechanism (Queryable type / AsyncLocalStorage) validated
// against a real multi-repository flow — building it now, with nothing to test it against,
// risks shipping something that looks correct but isn't. Lands in Phase 1.3 with
// `SyncWorkFromSource`. HTTP source clients and BullMQ wiring are also Phase 1.3.
export { baseEnvSchema, loadEnv, type BaseEnv } from './config/base-env.schema.js';
export {
  createLogger,
  withCorrelationId,
  type CreateLoggerOptions,
} from './logging/create-logger.js';

export { createDb, type Db, type DbHandle } from './db/client.js';
export * as schema from './db/schema.js';

export { PgEditionRepository } from './repositories/pg-edition-repository.js';
export { PgExternalRefRepository } from './repositories/pg-external-ref-repository.js';
export { PgIdempotencyStore } from './repositories/pg-idempotency-store.js';
export { PgSourceLinkRepository } from './repositories/pg-source-link-repository.js';
export { PgSyncLogRepository } from './repositories/pg-sync-log-repository.js';
export { PgWorkRepository } from './repositories/pg-work-repository.js';
