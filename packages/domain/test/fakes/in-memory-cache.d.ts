import type { CachePort } from '../../src/ports/cache.port.js';
export declare class InMemoryCache implements CachePort {
  private readonly store;
  private readonly ttls;
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
  /**
   * Test-only. Entries do not actually expire here — the TTL is recorded so a use case that picks
   * a *different* TTL for a degraded answer than for a complete one can be tested on that choice,
   * which is a real behaviour and not an implementation detail.
   */
  ttlOf(key: string): number | null;
  del(key: string): Promise<void>;
  deleteByPrefix(prefix: string): Promise<void>;
}
//# sourceMappingURL=in-memory-cache.d.ts.map
