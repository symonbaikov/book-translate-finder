// Phase 1.2 added the Postgres client factory, schema, and repository adapters for the
// idempotency-critical ports. Phase 1.3 adds real cross-repository transactions
// (`PgUnitOfWork` + transaction-context, docs/rules.md §2.3), HTTP source provider adapters, and
// BullMQ queue wiring.
export { baseEnvSchema, loadEnv, type BaseEnv } from './config/base-env.schema.js';
export {
  createLogger,
  withCorrelationId,
  type CreateLoggerOptions,
} from './logging/create-logger.js';

export { createDb, type Db, type DbHandle, type Queryable, type Tx } from './db/client.js';
export { PgUnitOfWork } from './db/pg-unit-of-work.js';
export * as schema from './db/schema.js';

export { createRedisClient } from './cache/redis-client.js';
export { RedisCache } from './cache/redis-cache.js';

export {
  createResilientFetcher,
  type ResilientFetcher,
  type ResilientFetchOptions,
} from './http/resilient-fetch.js';

export { GoogleBooksProvider } from './providers/google-books-provider.js';
export { OpenLibraryProvider } from './providers/open-library-provider.js';

export { Uuid7Generator } from './id/uuid7-generator.js';
export { SystemClock } from './time/system-clock.js';

export { BullMqQueue, type BullMqQueueOptions } from './queue/bullmq-queue.js';

export { PgEditionRepository } from './repositories/pg-edition-repository.js';
export { PgExternalRefRepository } from './repositories/pg-external-ref-repository.js';
export { PgIdempotencyStore } from './repositories/pg-idempotency-store.js';
export { PgSourceLinkRepository } from './repositories/pg-source-link-repository.js';
export { PgSyncLogRepository } from './repositories/pg-sync-log-repository.js';
export { PgWorkRepository } from './repositories/pg-work-repository.js';
