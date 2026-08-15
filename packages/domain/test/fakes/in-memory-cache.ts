import type { CachePort } from '../../src/ports/cache.port.js';

export class InMemoryCache implements CachePort {
  private readonly store = new Map<string, unknown>();
  private readonly ttls = new Map<string, number>();

  async get<T>(key: string): Promise<T | null> {
    return this.store.has(key) ? (this.store.get(key) as T) : null;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    this.store.set(key, value);
    this.ttls.set(key, ttlSeconds);
  }

  /**
   * Test-only. Entries do not actually expire here — the TTL is recorded so a use case that picks
   * a *different* TTL for a degraded answer than for a complete one can be tested on that choice,
   * which is a real behaviour and not an implementation detail.
   */
  ttlOf(key: string): number | null {
    return this.ttls.get(key) ?? null;
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
    this.ttls.delete(key);
  }

  async deleteByPrefix(prefix: string): Promise<void> {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
        this.ttls.delete(key);
      }
    }
  }
}
