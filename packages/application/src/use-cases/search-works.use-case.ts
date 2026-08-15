import {
  hasConflictingNumbers,
  normalizeText,
  sha256Hex,
  type CachePort,
  type Clock,
  type JobQueuePort,
  type SourceLinkRepository,
  type WorkSearchPort,
} from '@golden/domain';
import type { UseCase } from '../use-case.js';
import { CACHE_KEY_VERSION } from '../cache-key-version.js';

export interface SearchWorksInput {
  query: string;
  limit: number;
}

export interface SearchWorksHit {
  id: string;
  originalTitle: string;
  author: string;
  firstPublishedYear: number | null;
  coverUrl: string | null;
}

/** A search hit plus whether it has at least one free-to-download edition — see `withFreeCopyFlag`. */
export type SearchWorksHitWithFreeCopy = SearchWorksHit & { hasFreeCopy: boolean };

export type SearchWorksOutput =
  | { status: 'found'; results: SearchWorksHitWithFreeCopy[] }
  | { status: 'pending'; pollAfterMs: number }
  | { status: 'not_found' };

export interface SearchWorksDeps {
  workSearch: WorkSearchPort;
  cache: CachePort;
  backfillQueue: JobQueuePort;
  clock: Clock;
  sourceLinkRepository: SourceLinkRepository;
}

const RESULTS_TTL_SECONDS = 10 * 60;
/**
 * How well the best local hit must answer the query before this instance stops looking.
 *
 * Measured against real data on this instance: the answers a reader wanted scored 0.621
 * («Пикник на обочине Стругацкие» → *Roadside Picnic*), 0.759 ("War and Peace Tolstoy") and 1.000
 * («Мастер и Маргарита»); the answer they did not — *The Mountain Shadow* for «Шантарам», matched
 * on nothing but the shared author — scored 0.459. Anything under this bar is shown, because it
 * may well be the book, and simultaneously sent to the sources, because it may well not be.
 */
const CONFIDENT_MATCH_RANK = 0.55;
/** A weak answer is cached for a minute, not ten — long enough to absorb a polling page. */
const WEAK_RESULTS_TTL_SECONDS = 60;
const NEGATIVE_CACHE_TTL_SECONDS = 24 * 60 * 60;
const RESOLUTION_TTL_SECONDS = 24 * 60 * 60;
const POLL_AFTER_MS = 3_000;

function queryHash(query: string): string {
  return sha256Hex(normalizeText(query));
}

/** Hot-response cache for a query this instance can already answer from its own database. */
export function searchResultsCacheKey(query: string, limit: number): string {
  return `${CACHE_KEY_VERSION}:search:${queryHash(query)}:${limit}`;
}

/** Shared with the backfill queue consumer — it sets this after a backfill attempt finds nothing. */
export function searchNegativeCacheKey(query: string): string {
  return `${CACHE_KEY_VERSION}:search:negative:${queryHash(query)}`;
}

/** Shared with the backfill queue consumer — it sets this after a backfill *does* find something. */
export function searchResolutionCacheKey(query: string): string {
  return `${CACHE_KEY_VERSION}:search:resolved:${queryHash(query)}`;
}

function dateStamp(now: Date): string {
  return now.toISOString().slice(0, 10);
}

/** Shared with the backfill queue consumer, which registers the worker under this same jobId. */
export function backfillJobId(query: string, now: Date): string {
  return `backfill-${queryHash(query)}-${dateStamp(now)}`;
}

/**
 * `GET /api/search` (docs/architecture.md §4, ADR-0003 lazy backfill). A miss against our own
 * database never goes out to a provider synchronously — it queues a backfill job and returns
 * `pending` so the caller polls. Repeated identical misses don't keep re-queuing: a 24h negative
 * cache (written by the backfill consumer, not here) short-circuits straight to `not_found`.
 *
 * **The backfill's own answer is consulted before giving up.** Until now a poll could only be
 * satisfied by the trigram search finding the freshly-synced row by text — so a query that
 * resolved perfectly well at the source but landed in the database under a different spelling
 * («Преступление и наказание» typed, `Prestuplenie i nakazanie` stored) was searched for, synced,
 * and then not found, poll after poll, until the page gave up. The reader saw "the sources are
 * slow" about a book sitting in our own database, put there by their own search. Resolution is a
 * fact the backfill already knows and now writes down; matching text is an optimization on top of
 * it, not the only way to an answer.
 */
export class SearchWorks implements UseCase<SearchWorksInput, SearchWorksOutput> {
  constructor(private readonly deps: SearchWorksDeps) {}

  async execute(input: SearchWorksInput): Promise<SearchWorksOutput> {
    const resultsKey = searchResultsCacheKey(input.query, input.limit);
    const cached = await this.deps.cache.get<SearchWorksHit[]>(resultsKey);
    if (cached) {
      return { status: 'found', results: await this.withFreeCopyFlag(cached) };
    }

    const hits = await this.deps.workSearch.search(input.query, input.limit);
    if (hits.length > 0) {
      const results = hits.map(
        ({ id, originalTitle, author, firstPublishedYear, coverUrl }): SearchWorksHit => ({
          id,
          originalTitle,
          author,
          firstPublishedYear,
          coverUrl,
        }),
      );
      // A weak best match is served *and* questioned. "We found something" and "we found what
      // they asked for" are different facts, and treating the first as the second is how
      // «Шантарам» came back as *The Mountain Shadow* — a different novel by the same author,
      // scored on the author's name alone — while Shantaram itself was never fetched, because a
      // hit is what stops this instance from going out to the sources. Cached briefly rather than
      // for the usual ten minutes, so the better answer is not shut out for a quarter of an hour
      // after the backfill lands.
      //
      // A high trigram rank is *also* not enough on its own: «Metro 2035» matched the already-synced
      // «Metro 2033» edition title at 0.69 — well over the bar below — because the two strings
      // differ by a single digit. `hasConflictingNumbers` catches that specific shape (a shared
      // title with a mismatched year/volume/sequel number) and forces the same "show it, but keep
      // asking" treatment a low rank gets, rather than letting the rank alone rubber-stamp a
      // sequel-sized wrong answer as the final one. See its doc comment for the full case.
      const topHit = hits[0];
      const confident =
        (topHit?.rank ?? 1) >= CONFIDENT_MATCH_RANK &&
        !(topHit && hasConflictingNumbers(input.query, `${topHit.originalTitle} ${topHit.author}`));
      if (!confident) await this.enqueueBackfill(input.query);
      await this.deps.cache.set(
        resultsKey,
        results,
        confident ? RESULTS_TTL_SECONDS : WEAK_RESULTS_TTL_SECONDS,
      );
      return { status: 'found', results: await this.withFreeCopyFlag(results) };
    }

    // Nothing matched by text. Before deciding this instance has nothing, ask what the backfill
    // resolved this exact query to — it is consulted *after* the database search, not instead of
    // it, so a query the search can answer keeps its full, ranked answer rather than the single
    // work one sync happened to pick.
    const resolved = await this.deps.cache.get<SearchWorksHit[]>(
      searchResolutionCacheKey(input.query),
    );
    if (resolved && resolved.length > 0) {
      return {
        status: 'found',
        results: await this.withFreeCopyFlag(resolved.slice(0, input.limit)),
      };
    }

    const negativelyCached = await this.deps.cache.get<true>(searchNegativeCacheKey(input.query));
    if (negativelyCached) {
      return { status: 'not_found' };
    }

    await this.enqueueBackfill(input.query);
    return { status: 'pending', pollAfterMs: POLL_AFTER_MS };
  }

  private async enqueueBackfill(query: string): Promise<void> {
    const jobId = backfillJobId(query, this.deps.clock.now());
    await this.deps.backfillQueue.enqueue(jobId, { query });
  }

  /**
   * Computed fresh on every serve rather than cached alongside the rest of the hit — a cache
   * or backfill-resolution snapshot can predate enrichment adding a download link (see
   * `ProcessBackfillJob`'s comment: `markSearchResolved` is written *before* enrichment
   * finishes), so a value baked in at cache-write time would go stale exactly when a reader
   * is most likely to check it again.
   */
  private async withFreeCopyFlag(hits: SearchWorksHit[]): Promise<SearchWorksHitWithFreeCopy[]> {
    const free = await this.deps.sourceLinkRepository.hasFreeCopyByWorkIds(
      hits.map((hit) => hit.id),
    );
    return hits.map((hit) => ({ ...hit, hasFreeCopy: free.has(hit.id) }));
  }
}

/**
 * Called by the backfill consumer once it confirms a query truly has nothing (ADR-0003).
 *
 * `ttlSeconds` exists so the consumer can record a *weaker* "nothing" — see
 * `ProcessBackfillJob`'s degraded path, where a source failed instead of answering and the
 * conclusion deserves minutes of trust rather than a day's.
 */
export async function markSearchNotFound(
  cache: CachePort,
  query: string,
  ttlSeconds: number = NEGATIVE_CACHE_TTL_SECONDS,
): Promise<void> {
  await cache.set(searchNegativeCacheKey(query), true, ttlSeconds);
}

/**
 * Called by the backfill consumer when a source *did* resolve the query — the other half of
 * `markSearchNotFound`, and the reason a poll no longer depends on the trigram search recognising
 * the row that was just written.
 *
 * Kept for a day, the same as a confirmed "nothing": both are the same kind of fact about the same
 * query, and the work itself is in Postgres now anyway — this only records which one the reader's
 * words led to.
 */
export async function markSearchResolved(
  cache: CachePort,
  query: string,
  hits: readonly SearchWorksHit[],
): Promise<void> {
  if (hits.length === 0) return;
  await cache.set(searchResolutionCacheKey(query), hits, RESOLUTION_TTL_SECONDS);
}
