import type { CachePort } from '../../src/ports/cache.port.js';

export class InMemoryCache implements CachePort {
  private readonly store = new Map<string, unknown>();

  async get<T>(key: string): Promise<T | null> {
    return this.store.has(key) ? (this.store.get(key) as T) : null;
  }

  async set<T>(key: string, value: T, _ttlSeconds: number): Promise<void> {
    this.store.set(key, value);
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async deleteByPrefix(prefix: string): Promise<void> {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }
}
