import {
  BullMqQueue,
  createBullMqConnection,
  createDb,
  createRedisClient,
  createResilientFetcher,
  GoogleBooksProvider,
  OpenLibraryProvider,
  PgEditionRepository,
  PgExternalRefRepository,
  PgSourceLinkRepository,
  PgSyncLogRepository,
  PgUnitOfWork,
  PgWorkRepository,
  RedisCache,
  SystemClock,
  Uuid7Generator,
  type DbHandle,
} from '@btf/infrastructure';
import { ProcessBackfillJob, RefreshStaleWorks, SyncWorkFromSource } from '@btf/application';
import type { BookMetadataProvider } from '@btf/domain';
import type { Redis } from 'ioredis';
import type { WorkerEnv } from './config/worker-env.schema.js';

/** Every provider apps/worker knows about, in priority order (docs/architecture.md §5 source priority). */
export const REGISTERED_SOURCES = ['open-library', 'google-books'] as const;

export interface WorkerContext {
  db: DbHandle;
  cacheRedis: Redis;
  bullConnection: Redis;
  workRepository: PgWorkRepository;
  syncQueue: BullMqQueue;
  backfillQueue: BullMqQueue;
  syncWorkFromSource: SyncWorkFromSource;
  refreshStaleWorks: RefreshStaleWorks;
  processBackfillJob: ProcessBackfillJob;
  close: () => Promise<void>;
}

/**
 * Wires every real adapter for apps/worker (docs/architecture.md §2.5) — the only place in the
 * process allowed to know about Postgres, Redis, or BullMQ concretely. Everything downstream
 * (use cases) only sees ports.
 */
export function buildWorkerContext(env: WorkerEnv): WorkerContext {
  const db = createDb(env.DATABASE_URL);
  const cacheRedis = createRedisClient(env.REDIS_URL);
  const cache = new RedisCache(cacheRedis);
  const bullConnection = createBullMqConnection(env.REDIS_URL);

  const workRepository = new PgWorkRepository(db.db);
  const editionRepository = new PgEditionRepository(db.db);
  const sourceLinkRepository = new PgSourceLinkRepository(db.db);
  const externalRefRepository = new PgExternalRefRepository(db.db);
  const syncLogRepository = new PgSyncLogRepository(db.db);
  const unitOfWork = new PgUnitOfWork(db.db);

  const fetcher = createResilientFetcher();
  const userAgent = `BookTranslateFinder/0.1 (+${env.CONTACT_URL})`;
  const providers = new Map<string, BookMetadataProvider>([
    ['open-library', new OpenLibraryProvider(fetcher, cache, userAgent)],
    ['google-books', new GoogleBooksProvider(fetcher, cache, env.GOOGLE_BOOKS_API_KEY)],
  ]);

  const clock = new SystemClock();
  const idGenerator = new Uuid7Generator();

  const syncWorkFromSource = new SyncWorkFromSource({
    providers,
    workRepository,
    editionRepository,
    sourceLinkRepository,
    externalRefRepository,
    syncLogRepository,
    unitOfWork,
    cache,
    clock,
    idGenerator,
  });

  const syncQueue = new BullMqQueue('sync', bullConnection);
  const backfillQueue = new BullMqQueue('backfill', bullConnection);

  const refreshStaleWorks = new RefreshStaleWorks({
    workRepository,
    syncQueue,
    clock,
    sources: REGISTERED_SOURCES,
  });

  const processBackfillJob = new ProcessBackfillJob({
    syncWorkFromSource,
    cache,
    sources: REGISTERED_SOURCES,
  });

  return {
    db,
    cacheRedis,
    bullConnection,
    workRepository,
    syncQueue,
    backfillQueue,
    syncWorkFromSource,
    refreshStaleWorks,
    processBackfillJob,
    close: async () => {
      await syncQueue.close();
      await backfillQueue.close();
      await db.close();
      cacheRedis.disconnect();
      bullConnection.disconnect();
    },
  };
}
