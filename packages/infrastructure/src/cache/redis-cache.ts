import type { CachePort } from '@golden/domain';
import type { Redis } from 'ioredis';

/**
 * Redis-backed `CachePort` (docs/architecture.md §6). Keys are versioned by callers
 * (`v1:{route}:{hash}`) — this adapter has no opinion on key shape, it just stores JSON.
 */
export class RedisCache implements CachePort {
  constructor(private readonly redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.redis.get(key);
    return raw === null ? null : (JSON.parse(raw) as T);
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  /**
   * Used for invalidation by `work_id` after a sync completes (docs/architecture.md §6). Uses
   * `SCAN` + `UNLINK` rather than `KEYS` + `DEL` — `KEYS` blocks the whole Redis instance while
   * it walks the keyspace, which is fine on a laptop but not on a shared production instance;
   * `SCAN` is cursor-based and non-blocking, `UNLINK` reclaims memory asynchronously.
   */
  async deleteByPrefix(prefix: string): Promise<void> {
    const pattern = `${prefix}*`;
    let cursor = '0';
    do {
      const [nextCursor, keys] = await this.redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;
      if (keys.length > 0) {
        await this.redis.unlink(...keys);
      }
    } while (cursor !== '0');
  }
}
