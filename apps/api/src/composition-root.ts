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
  createResilientFetcher,
  HttpImageFetcher,
  PgEditionRepository,
  PgExternalRefRepository,
  PgFreeBooksAdapter,
  PgIdempotencyStore,
  PgSourceLinkRepository,
  PgWorkRepository,
  OpenLibrarySubjectSource,
  PgSubjectBrowseAdapter,
  PgWorkSearchAdapter,
  RedisCache,
  SystemClock,
  BookstoreCatalogPriceProvider,
  GoogleBooksPriceProvider,
  GoogleBooksRatingProvider,
  OpenLibraryReviewLinkProvider,
  OverpassGeoStoreAdapter,
  PublicOpdsCatalog,
  WikipediaDescriptionProvider,
  type DbHandle,
} from '@golden/infrastructure';
import { OpdsClient } from '@golden/plugins';
import {
  AggregateEditionPrices,
  AggregateTranslationRatings,
  AuthService,
  BookmarkService,
  EnqueueSourceSync,
  FindNearbyStores,
  BrowseBySubject,
  GetFeaturedBooks,
  ListFreeBooks,
  ListSubjects,
  RecommendBooks,
  GetCoverImage,
  GetEditionLinks,
  GetWorkCard,
  ListEditionsForWork,
  SearchWorks,
} from '@golden/application';
import type { Redis } from 'ioredis';
import type { ApiEnv } from './config/api-env.schema.js';

export interface ApiContext {
  db: DbHandle;
  cacheRedis: Redis;
  bullConnection: Redis;
  searchWorks: SearchWorks;
  getWorkCard: GetWorkCard;
  listEditionsForWork: ListEditionsForWork;
  getCoverImage: GetCoverImage;
  getEditionLinks: GetEditionLinks;
  aggregateEditionPrices: AggregateEditionPrices;
  aggregateTranslationRatings: AggregateTranslationRatings;
  publicOpdsCatalog: PublicOpdsCatalog;
  /** Null unless ENABLE_SERVER_GEO_LOOKUP is on — see StoresController and docs/adr/0007. */
  findNearbyStores: FindNearbyStores | null;
  enqueueSourceSync: EnqueueSourceSync;
  getFeaturedBooks: GetFeaturedBooks;
  listFreeBooks: ListFreeBooks;
  listSubjects: ListSubjects;
  browseBySubject: BrowseBySubject;
  recommendBooks: RecommendBooks;
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

  const searchWorks = new SearchWorks({
    workSearch,
    cache,
    backfillQueue,
    clock,
    sourceLinkRepository,
  });
  // One fetcher per source, reused for every call — the circuit breaker only counts failures on a
  // shared instance (see ResilientFetcher).
  const userAgent = `GoldenLibrary/0.1 (+${env.CONTACT_URL})`;
  const getWorkCard = new GetWorkCard({
    workRepository,
    editionRepository,
    externalRefRepository,
    cache,
    // Needs no key and no configuration, which is the point: a self-host with no paid source still
    // describes a book in the reader's language (docs/architecture.md §5).
    localizedDescription: new WikipediaDescriptionProvider(
      createResilientFetcher(),
      cache,
      userAgent,
    ),
  });
  const listEditionsForWork = new ListEditionsForWork({
    workRepository,
    editionRepository,
    sourceLinkRepository,
    cache,
  });
  // Its own fetcher, deliberately: a cover is decoration, and its circuit breaker must not be the
  // one a metadata source shares — a slow image host should never trip the breaker that answers
  // "which languages is this book in".
  const getCoverImage = new GetCoverImage({
    images: new HttpImageFetcher(createResilientFetcher(), userAgent),
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

  // Module C. Order matters only in that the reader's own market is queried first; the aggregator
  // groups and sorts the result itself. Google Play is registered even without a key — it answers
  // with an empty list in that case rather than pretending, and self-hosts commonly have no key
  // (docs/architecture.md §9.2).
  const aggregateEditionPrices = new AggregateEditionPrices({
    editionRepository,
    workRepository,
    priceProviders: [
      new GoogleBooksPriceProvider(createResilientFetcher(), cache, env.GOOGLE_BOOKS_API_KEY),
      new BookstoreCatalogPriceProvider(),
    ],
    cache,
    clock,
  });

  // Reader ratings per edition. Registered with or without a key for symmetry with the price
  // provider, but unlike prices it is dark without one: the keyless Google quota is a single
  // shared project and permanently exhausted (docs/plan.md 4.10), so an instance with no
  // GOOGLE_BOOKS_API_KEY simply shows no ratings rather than a fabricated or stale number.
  const aggregateTranslationRatings = new AggregateTranslationRatings({
    editionRepository,
    workRepository,
    ratingProviders: [
      new GoogleBooksRatingProvider(createResilientFetcher(), cache, env.GOOGLE_BOOKS_API_KEY),
    ],
    // The keyless half, and on an instance with no Google key the only half that answers: Open
    // Library's identifiers say where a printing lives on Goodreads, and a link built from an id
    // costs no key and no scraping.
    reviewProviders: [
      new OpenLibraryReviewLinkProvider(createResilientFetcher(), cache, userAgent),
    ],
    cache,
    clock,
  });

  // Module A, server half: the built-in catalogs only. A reader's own OPDS server is fetched by
  // their browser and its URL never reaches this process (docs/adr/0007).
  const publicOpdsCatalog = new PublicOpdsCatalog(new OpdsClient({ userAgent }), cache);

  // Module B, opt-in half. Off by default so coordinates stay on the reader's device.
  const findNearbyStores = env.ENABLE_SERVER_GEO_LOOKUP
    ? new FindNearbyStores({ geoStoreAdapters: [new OverpassGeoStoreAdapter()] })
    : null;

  const subjectBrowse = new PgSubjectBrowseAdapter(db.db);
  const subjectSource = new OpenLibrarySubjectSource(createResilientFetcher(), cache, userAgent);

  const getFeaturedBooks = new GetFeaturedBooks({
    workRepository,
    workSearch,
    editionRepository,
    sourceLinkRepository,
    cache,
    backfillQueue,
    // The reader's-language row is a subject query, so it shares the genre pages' adapters rather
    // than growing a second path to the same data (docs/rules.md §1 ISP).
    subjectBrowse,
    subjectSource,
  });

  // The free shelf reads the same `is_legal_free` flag the link policy writes — no source to go
  // out to, so no backfill queue here (see ListFreeBooks).
  const listFreeBooks = new ListFreeBooks({ freeBooks: new PgFreeBooksAdapter(db.db), cache });

  const listSubjects = new ListSubjects({ subjectBrowse, cache });
  const browseBySubject = new BrowseBySubject({
    subjectBrowse,
    cache,
    subjectSource,
    backfillQueue,
  });
  const recommendBooks = new RecommendBooks({ subjectBrowse, cache });

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
    getCoverImage,
    getEditionLinks,
    aggregateEditionPrices,
    aggregateTranslationRatings,
    publicOpdsCatalog,
    findNearbyStores,
    enqueueSourceSync,
    getFeaturedBooks,
    listFreeBooks,
    listSubjects,
    browseBySubject,
    recommendBooks,
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
