import {
  BullMqQueue,
  CryptoTokenGenerator,
  GoogleOAuthClient,
  NoopEmailSender,
  PgBookmarkRepository,
  PgSessionRepository,
  PgUserRepository,
  ScryptPasswordHasher,
  SmtpEmailSender,
  Uuid7Generator,
  createBullMqConnection,
  createDb,
  createRedisClient,
  PgEditionRepository,
  PgExternalRefRepository,
  PgIdempotencyStore,
  PgSourceLinkRepository,
  PgWorkRepository,
  PgWorkSearchAdapter,
  RedisCache,
  SystemClock,
  type DbHandle,
} from '@btf/infrastructure';
import {
  AuthService,
  BookmarkService,
  EnqueueSourceSync,
  GetFeaturedBooks,
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
  getFeaturedBooks: GetFeaturedBooks;
  authService: AuthService;
  bookmarkService: BookmarkService;
  workRepository: PgWorkRepository;
  authConfig: { webBaseUrl: string; secureCookies: boolean };
  /** Null unless both Google credentials are configured — see AuthController. */
  googleOAuth: GoogleOAuthClient | null;
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
  const externalRefRepository = new PgExternalRefRepository(db.db);
  const workSearch = new PgWorkSearchAdapter(db.db);
  const idempotencyStore = new PgIdempotencyStore(db.db);

  const clock = new SystemClock();
  const syncQueue = new BullMqQueue('sync', bullConnection);
  const backfillQueue = new BullMqQueue('backfill', bullConnection);

  const searchWorks = new SearchWorks({ workSearch, cache, backfillQueue, clock });
  const getWorkCard = new GetWorkCard({
    workRepository,
    editionRepository,
    externalRefRepository,
    cache,
  });
  const listEditionsForWork = new ListEditionsForWork({
    workRepository,
    editionRepository,
    sourceLinkRepository,
    cache,
  });
  const getEditionLinks = new GetEditionLinks({
    editionRepository,
    workRepository,
    sourceLinkRepository,
    cache,
    clock,
  });
  const enqueueSourceSync = new EnqueueSourceSync({ idempotencyStore, syncQueue, clock });

  const getFeaturedBooks = new GetFeaturedBooks({
    workRepository,
    editionRepository,
    sourceLinkRepository,
    cache,
    backfillQueue,
  });

  const idGenerator = new Uuid7Generator();
  // No SMTP configured is the documented self-hosting default, not a misconfiguration: sign-up
  // must work on a fresh `docker compose up` (CLAUDE.md), so the greeting is simply skipped.
  const emailSender = env.SMTP_URL
    ? new SmtpEmailSender({
        smtpUrl: env.SMTP_URL,
        from: env.MAIL_FROM,
        publicUrl: env.PUBLIC_URL,
      })
    : new NoopEmailSender();

  const authService = new AuthService({
    userRepository: new PgUserRepository(db.db),
    sessionRepository: new PgSessionRepository(db.db),
    passwordHasher: new ScryptPasswordHasher(),
    tokenGenerator: new CryptoTokenGenerator(),
    emailSender,
    idGenerator,
    clock,
  });

  const bookmarkService = new BookmarkService({
    bookmarkRepository: new PgBookmarkRepository(db.db),
    workRepository,
    clock,
  });

  // Both halves or neither: a button that always fails is worse than no button at all.
  const googleOAuth =
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? new GoogleOAuthClient({
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
          redirectUri: `${env.PUBLIC_URL.replace(/\/$/, '')}/api/auth/google/callback`,
        })
      : null;

  return {
    db,
    cacheRedis,
    bullConnection,
    searchWorks,
    getWorkCard,
    listEditionsForWork,
    getEditionLinks,
    enqueueSourceSync,
    getFeaturedBooks,
    authService,
    bookmarkService,
    workRepository,
    authConfig: {
      webBaseUrl: env.WEB_BASE_URL.replace(/\/$/, ''),
      // A `Secure` cookie is never sent over plain http, so marking it on a local run would sign
      // everyone out silently. TLS in production is the reverse proxy's job (docker/Caddyfile).
      secureCookies: env.PUBLIC_URL.startsWith('https://'),
    },
    googleOAuth,
    close: async () => {
      await syncQueue.close();
      await backfillQueue.close();
      await db.close();
      cacheRedis.disconnect();
      bullConnection.disconnect();
    },
  };
}
