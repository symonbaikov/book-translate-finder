import {
  normalizeText,
  sha256Hex,
  type CachePort,
  type Clock,
  type JobQueuePort,
  type WorkSearchPort,
} from '@btf/domain';
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
}

export type SearchWorksOutput =
  | { status: 'found'; results: SearchWorksHit[] }
  | { status: 'pending'; pollAfterMs: number }
  | { status: 'not_found' };

export interface SearchWorksDeps {
  workSearch: WorkSearchPort;
  cache: CachePort;
  backfillQueue: JobQueuePort;
  clock: Clock;
}

const RESULTS_TTL_SECONDS = 10 * 60;
const NEGATIVE_CACHE_TTL_SECONDS = 24 * 60 * 60;
const POLL_AFTER_MS = 3_000;

function queryHash(query: string): string {
  return sha256Hex(normalizeText(query));
}

/** Shared with the backfill queue consumer (apps/worker) so it writes the exact key this reads. */
export function searchResultsCacheKey(query: string, limit: number): string {
  return `${CACHE_KEY_VERSION}:search:${queryHash(query)}:${limit}`;
}

/** Shared with the backfill queue consumer — it sets this after a backfill attempt finds nothing. */
export function searchNegativeCacheKey(query: string): string {
  return `${CACHE_KEY_VERSION}:search:negative:${queryHash(query)}`;
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
 */
export class SearchWorks implements UseCase<SearchWorksInput, SearchWorksOutput> {
  constructor(private readonly deps: SearchWorksDeps) {}

  async execute(input: SearchWorksInput): Promise<SearchWorksOutput> {
    const resultsKey = searchResultsCacheKey(input.query, input.limit);
    const cached = await this.deps.cache.get<SearchWorksHit[]>(resultsKey);
    if (cached) {
      return { status: 'found', results: cached };
    }

    const hits = await this.deps.workSearch.search(input.query, input.limit);
    if (hits.length > 0) {
      await this.deps.cache.set(resultsKey, hits, RESULTS_TTL_SECONDS);
      return { status: 'found', results: hits };
    }

    const negativelyCached = await this.deps.cache.get<true>(searchNegativeCacheKey(input.query));
    if (negativelyCached) {
      return { status: 'not_found' };
    }

    const jobId = backfillJobId(input.query, this.deps.clock.now());
    await this.deps.backfillQueue.enqueue(jobId, { query: input.query });
    return { status: 'pending', pollAfterMs: POLL_AFTER_MS };
  }
}

/** Called by the backfill consumer once it confirms a query truly has nothing (ADR-0003). */
export async function markSearchNotFound(cache: CachePort, query: string): Promise<void> {
  await cache.set(searchNegativeCacheKey(query), true, NEGATIVE_CACHE_TTL_SECONDS);
}
