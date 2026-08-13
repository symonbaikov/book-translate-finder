import {
  BullMqQueue,
  createBullMqConnection,
  createDb,
  createRedisClient,
  PgEditionRepository,
  PgIdempotencyStore,
  PgSourceLinkRepository,
  PgWorkRepository,
  PgWorkSearchAdapter,
  RedisCache,
  SystemClock,
  type DbHandle,
} from '@btf/infrastructure';
import {
  EnqueueSourceSync,
  GetEditionLinks,
  GetWorkCard,
  ListEditionsForWork,
  SearchWorks,
} from '@btf/application';
import type { Redis } from 'ioredis';
import type { ApiEnv } from './config/api-env.schema.js';

export interface ApiContext {
  db: DbHandle;
  cacheRedis: Redis;
  bullConnection: Redis;
  searchWorks: SearchWorks;
  getWorkCard: GetWorkCard;
  listEditionsForWork: ListEditionsForWork;
  getEditionLinks: GetEditionLinks;
  enqueueSourceSync: EnqueueSourceSync;
  close: () => Promise<void>;
}

/** Wires every real adapter for apps/api (docs/architecture.md §2.5). apps/api never touches a
 * provider directly — `POST /api/sync/:source` only enqueues, `SyncWorkFromSource` runs in
 * apps/worker (docs/architecture.md §5 flow diagram). */
export function buildApiContext(env: ApiEnv): ApiContext {
  const db = createDb(env.DATABASE_URL);
  const cacheRedis = createRedisClient(env.REDIS_URL);
  const cache = new RedisCache(cacheRedis);
  const bullConnection = createBullMqConnection(env.REDIS_URL);

  const workRepository = new PgWorkRepository(db.db);
  const editionRepository = new PgEditionRepository(db.db);
  const sourceLinkRepository = new PgSourceLinkRepository(db.db);
  const workSearch = new PgWorkSearchAdapter(db.db);
  const idempotencyStore = new PgIdempotencyStore(db.db);

  const clock = new SystemClock();
  const syncQueue = new BullMqQueue('sync', bullConnection);
  const backfillQueue = new BullMqQueue('backfill', bullConnection);

  const searchWorks = new SearchWorks({ workSearch, cache, backfillQueue, clock });
  const getWorkCard = new GetWorkCard({ workRepository, editionRepository, cache });
  const listEditionsForWork = new ListEditionsForWork({ workRepository, editionRepository, cache });
  const getEditionLinks = new GetEditionLinks({ editionRepository, sourceLinkRepository, cache });
  const enqueueSourceSync = new EnqueueSourceSync({ idempotencyStore, syncQueue, clock });

  return {
    db,
    cacheRedis,
    bullConnection,
    searchWorks,
    getWorkCard,
    listEditionsForWork,
    getEditionLinks,
    enqueueSourceSync,
    close: async () => {
      await syncQueue.close();
      await backfillQueue.close();
      await db.close();
      cacheRedis.disconnect();
      bullConnection.disconnect();
    },
  };
}
