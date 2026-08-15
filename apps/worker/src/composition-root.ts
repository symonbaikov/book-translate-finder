import {
  BullMqQueue,
  createBullMqConnection,
  createDb,
  createRedisClient,
  createResilientFetcher,
  GoogleBooksProvider,
  AuthorizedFreeProvider,
  GutenbergProvider,
  LibriVoxProvider,
  OpenLibraryProvider,
  WikidataProvider,
  createBnfProvider,
  createDnbProvider,
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
} from '@golden/infrastructure';
import { ProcessBackfillJob, RefreshStaleWorks, SyncWorkFromSource } from '@golden/application';
import type { BookMetadataProvider } from '@golden/domain';
import type { Redis } from 'ioredis';
import type { WorkerEnv } from './config/worker-env.schema.js';

/**
 * Sources tried to *discover* a book, in order — the first one that has it wins
 * (docs/architecture.md §5 source priority).
 *
 * Wikidata sits at the end deliberately. It is the only source that reliably knows a
 * contemporary or non-English book exists at all (measured: seven of seven books this instance
 * could not find under any spelling, against one for Open Library), but it holds almost no
 * editions — so it must never beat a source that can describe what a reader could actually hold.
 * Last place is exactly "use it when nobody else knows this book".
 */
export const REGISTERED_SOURCES = [
  'open-library',
  'gutenberg',
  'authorized-free',
  'librivox',
  'google-books',
  'wikidata',
] as const;

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
  const userAgent = `GoldenLibrary/0.1 (+${env.CONTACT_URL})`;
  const providers = new Map<string, BookMetadataProvider>([
    ['open-library', new OpenLibraryProvider(fetcher, cache, userAgent)],
    ['gutenberg', new GutenbergProvider(fetcher, cache, userAgent)],
    ['authorized-free', new AuthorizedFreeProvider()],
    ['librivox', new LibriVoxProvider(fetcher, cache, userAgent)],
    ['google-books', new GoogleBooksProvider(fetcher, cache, env.GOOGLE_BOOKS_API_KEY)],
    ['wikidata', new WikidataProvider(fetcher, cache, userAgent)],
    ['bnf', createBnfProvider(fetcher, cache, userAgent)],
    ['dnb', createDnbProvider(fetcher, cache, userAgent)],
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
    // Sources that run even when another one already found the work, because each answers a
    // question no other can: Gutenberg is the only one that yields downloadable files, and the
    // two national library catalogues are the only ones that know a contemporary novel came out
    // in French or German at all — with the publisher, the ISBN and the translator's name, which
    // is the fact this project promises and open bibliographic data almost never carries.
    enrichmentSources: ['gutenberg', 'authorized-free', 'librivox', 'bnf', 'dnb'],
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
