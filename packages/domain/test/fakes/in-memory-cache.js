export class InMemoryCache {
  store = new Map();
  ttls = new Map();
  async get(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  async set(key, value, ttlSeconds) {
    this.store.set(key, value);
    this.ttls.set(key, ttlSeconds);
  }
  /**
   * Test-only. Entries do not actually expire here — the TTL is recorded so a use case that picks
   * a *different* TTL for a degraded answer than for a complete one can be tested on that choice,
   * which is a real behaviour and not an implementation detail.
   */
  ttlOf(key) {
    return this.ttls.get(key) ?? null;
  }
  async del(key) {
    this.store.delete(key);
    this.ttls.delete(key);
  }
  async deleteByPrefix(prefix) {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
        this.ttls.delete(key);
      }
    }
  }
}
//# sourceMappingURL=in-memory-cache.js.map
