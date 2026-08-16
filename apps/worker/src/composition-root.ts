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
  GallicaProvider,
  NdlProvider,
  OpenLibraryProvider,
  PolishLibraryProvider,
  WikidataProvider,
  createBnfProvider,
  createDnbProvider,
  createK10plusProvider,
  createLibrisProvider,
  createLocProvider,
  createMelindaProvider,
  createSwisscoveryProvider,
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

/**
 * Sources asked about a book somebody else has already identified, never allowed to decide for
 * themselves which book they answered (`attachToWorkId`).
 *
 * Used in two places, and it has to be the same list in both: `ProcessBackfillJob` runs them once,
 * when a book is first discovered, and `RefreshStaleWorks` runs them again on the nightly pass.
 * Without the second, a catalogue added today is asked about every book found from today onward
 * and about none of the books already in the database — which is exactly how «Метро 2034» sat at
 * zero editions while seven of these catalogues held it.
 */
// Sources that run even when another one already found the work, because each answers a
// question no other can: Gutenberg is the only one that yields downloadable files, and the
// two national library catalogues are the only ones that know a contemporary novel came out
// in French or German at all — with the publisher, the ISBN and the translator's name, which
// is the fact this project promises and open bibliographic data almost never carries.
//
// Wikidata was already a *discovery* source and is now an enrichment one too, which is a
// separate job: discovery asks "does this book exist", enrichment asks "what languages is it
// in", and it was only ever being asked the first. Measured over five books
// (scripts/measure-wikidata-languages.ts), it adds languages nobody else here had — nine to
// Le petit prince, including Kinyarwanda, Xhosa, Wolof and Zulu, and three to Dracula.
//
// It is worth stating what it does not do, since it is easy to read the above as a fix: on
// «Метро 2033» — the book whose thin language list prompted the measurement — Wikidata holds
// no editions at all and contributes exactly nothing. This widens good coverage; it does not
// rescue bad coverage.
//
// The catalogues added after the first two are all edition catalogues too, and each was
// added because it holds printings the others do not: K10plus is a *union* catalogue where the
// DNB is a deposit library, so it holds what several hundred libraries actually own — the
// out-of-print, the numbered and the limited (measured live: 78 records for Vodolazkin against
// the DNB's 9). The Library of Congress is the English-language counterpart none of the
// continental ones could be. LIBRIS, the Polish National Library and the National Diet Library
// of Japan each answer in languages no other source here has — the NDL reaches Japanese and
// Chinese editions through the romanized author and title it records alongside the originals.
// All but the NDL are read as MARC, which is what finally puts the edition
// statement — "First edition", "Limited ed., signed" — on the card: Dublin Core has no element
// for it, so through the BnF and the DNB a collector's printing is indistinguishable from the
// twelfth reprint.
//
// Order is cost, not priority: the enrichment loop asks all of them and merges, so the cheap
// and near-certain sources go first and the catalogues, which are a round trip each, follow.
export const ENRICHMENT_SOURCES = [
  'gutenberg',
  'authorized-free',
  'librivox',
  'bnf',
  'dnb',
  'k10plus',
  'loc',
  'libris',
  'melinda',
  'swisscovery',
  'bn-poland',
  'ndl',
  'gallica',
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
    ['k10plus', createK10plusProvider(fetcher, cache, userAgent)],
    ['loc', createLocProvider(fetcher, cache, userAgent)],
    ['libris', createLibrisProvider(fetcher, cache, userAgent)],
    ['melinda', createMelindaProvider(fetcher, cache, userAgent)],
    ['swisscovery', createSwisscoveryProvider(fetcher, cache, userAgent)],
    ['bn-poland', new PolishLibraryProvider(fetcher, cache, userAgent)],
    ['ndl', new NdlProvider(fetcher, cache, userAgent)],
    ['gallica', new GallicaProvider(fetcher, cache, userAgent)],
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
    enrichmentSources: ENRICHMENT_SOURCES,
  });

  const processBackfillJob = new ProcessBackfillJob({
    syncWorkFromSource,
    cache,
    sources: REGISTERED_SOURCES,
    enrichmentSources: ENRICHMENT_SOURCES,
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
