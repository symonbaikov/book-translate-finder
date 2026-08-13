import { describe, expect, it } from 'vitest';
import { FixedClock } from './fixed-clock.js';
import { InMemoryCache } from './in-memory-cache.js';
import { InMemoryJobQueue } from './in-memory-job-queue.js';
import { SequentialIdGenerator } from './sequential-id-generator.js';

describe('FixedClock', () => {
  it('returns the same instant until set() is called', () => {
    const clock = new FixedClock(new Date('2026-01-01T00:00:00Z'));
    expect(clock.now()).toEqual(new Date('2026-01-01T00:00:00Z'));
    expect(clock.now()).toEqual(new Date('2026-01-01T00:00:00Z'));

    clock.set(new Date('2026-06-01T00:00:00Z'));
    expect(clock.now()).toEqual(new Date('2026-06-01T00:00:00Z'));
  });
});

describe('SequentialIdGenerator', () => {
  it('hands out distinct, deterministic ids in order', () => {
    const gen = new SequentialIdGenerator();
    expect(gen.newId()).toBe('id-1');
    expect(gen.newId()).toBe('id-2');
    expect(gen.newId()).toBe('id-3');
  });
});

describe('InMemoryCache', () => {
  it('stores and retrieves values', async () => {
    const cache = new InMemoryCache();
    expect(await cache.get('k')).toBeNull();

    await cache.set('k', { hello: 'world' }, 60);
    expect(await cache.get('k')).toEqual({ hello: 'world' });
  });

  it('del removes a single key', async () => {
    const cache = new InMemoryCache();
    await cache.set('k', 1, 60);
    await cache.del('k');
    expect(await cache.get('k')).toBeNull();
  });

  it('deleteByPrefix removes every matching key, leaving others intact', async () => {
    const cache = new InMemoryCache();
    await cache.set('v1:work:1:search', 'a', 60);
    await cache.set('v1:work:1:editions', 'b', 60);
    await cache.set('v1:work:2:search', 'c', 60);

    await cache.deleteByPrefix('v1:work:1:');

    expect(await cache.get('v1:work:1:search')).toBeNull();
    expect(await cache.get('v1:work:1:editions')).toBeNull();
    expect(await cache.get('v1:work:2:search')).toBe('c');
  });
});

describe('InMemoryJobQueue', () => {
  it('records enqueued jobs', async () => {
    const queue = new InMemoryJobQueue();
    await queue.enqueue('sync:open-library:work-1:2026-01-01', { workId: 'work-1' });
    expect(queue.enqueued).toHaveLength(1);
  });

  it('dedupes by jobId — a repeated enqueue of the same id is a no-op', async () => {
    const queue = new InMemoryJobQueue();
    await queue.enqueue('sync:open-library:work-1:2026-01-01', { attempt: 1 });
    await queue.enqueue('sync:open-library:work-1:2026-01-01', { attempt: 2 });

    expect(queue.enqueued).toHaveLength(1);
    expect(queue.enqueued[0]?.payload).toEqual({ attempt: 1 });
  });
});
