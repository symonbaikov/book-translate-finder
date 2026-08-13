/**
 * Redis-backed hot-response cache (docs/architecture.md §6). Keys are versioned by callers
 * (`v1:{route}:{hash}`) — this port just stores bytes-ish values, it has no opinion on key shape.
 */
export interface CachePort {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
  /** Used for invalidation by `work_id` after a sync completes (docs/architecture.md §6). */
  deleteByPrefix(prefix: string): Promise<void>;
}
