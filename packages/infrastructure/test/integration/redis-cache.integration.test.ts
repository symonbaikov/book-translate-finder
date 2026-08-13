import { RedisContainer, type StartedRedisContainer } from '@testcontainers/redis';
import { Redis } from 'ioredis';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { RedisCache } from '../../src/cache/redis-cache.js';

describe('RedisCache', () => {
  let container: StartedRedisContainer;
  let redis: Redis;
  let cache: RedisCache;

  beforeAll(async () => {
    container = await new RedisContainer('redis:7-alpine').start();
    redis = new Redis(container.getConnectionUrl());
    cache = new RedisCache(redis);
  });

  afterAll(async () => {
    redis.disconnect();
    await container.stop();
  });

  it('returns null for a key that was never set', async () => {
    expect(await cache.get('missing')).toBeNull();
  });

  it('set() then get() round-trips a JSON-serializable value', async () => {
    await cache.set('k1', { title: 'War and Peace', languages: ['en', 'ru'] }, 60);
    expect(await cache.get('k1')).toEqual({ title: 'War and Peace', languages: ['en', 'ru'] });
  });

  it('respects the TTL — an expired key reads back as null', async () => {
    await cache.set('short-lived', 'value', 1);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    expect(await cache.get('short-lived')).toBeNull();
  });

  it('del() removes a single key without touching others', async () => {
    await cache.set('a', 1, 60);
    await cache.set('b', 2, 60);
    await cache.del('a');
    expect(await cache.get('a')).toBeNull();
    expect(await cache.get('b')).toBe(2);
  });

  it('deleteByPrefix removes every matching key, leaving unrelated keys intact', async () => {
    await cache.set('v1:work:1:search', 'x', 60);
    await cache.set('v1:work:1:editions', 'y', 60);
    await cache.set('v1:work:2:search', 'z', 60);

    await cache.deleteByPrefix('v1:work:1:');

    expect(await cache.get('v1:work:1:search')).toBeNull();
    expect(await cache.get('v1:work:1:editions')).toBeNull();
    expect(await cache.get('v1:work:2:search')).toBe('z');
  });

  it('deleteByPrefix handles more keys than a single SCAN batch (COUNT 100)', async () => {
    const keys = Array.from({ length: 250 }, (_, i) => `v1:bulk:${i}`);
    await Promise.all(keys.map((k) => cache.set(k, 'x', 60)));

    await cache.deleteByPrefix('v1:bulk:');

    const remaining = await Promise.all(keys.map((k) => cache.get(k)));
    expect(remaining.every((v) => v === null)).toBe(true);
  });
});
