import { describe, expect, it } from 'vitest';
import { assertLinkAllowed } from '../../src/policy/link-policy.js';
import { ProviderId } from '../../src/value-objects/provider-id.js';
import { FixedClock } from './fixed-clock.js';
import { InMemoryCache } from './in-memory-cache.js';
import { InMemoryJobQueue } from './in-memory-job-queue.js';
import { InMemorySourceLinkRepository } from './in-memory-source-link-repository.js';
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

describe('InMemorySourceLinkRepository', () => {
  // `hasFreeCopyByWorkIds` isn't part of the shared cross-implementation contract suite
  // (source-link-repository.contract-suite.ts) — that suite only knows edition ids, never
  // work ids, since `SourceLink` itself doesn't carry one. Covered here instead, the same way
  // `deleteByPrefix`/dedup-by-jobId above cover fake-specific behavior the generic port
  // contract has no notion of.
  const makeLink = (overrides: Partial<Parameters<typeof assertLinkAllowed>[0]> = {}) =>
    assertLinkAllowed({
      id: 'link-1',
      editionId: 'edition-1',
      type: 'download',
      url: 'https://www.gutenberg.org/ebooks/1342',
      provider: ProviderId.create('gutenberg'),
      rightsStatus: 'public_domain',
      verifiedAt: new Date('2026-01-01T00:00:00Z'),
      ...overrides,
    });

  it('reports a work id free once its (mapped) edition has an isLegalFree link', async () => {
    const repo = new InMemorySourceLinkRepository();
    repo.workIdByEditionId.set('edition-1', 'work-1');
    await repo.save(makeLink());

    expect(await repo.hasFreeCopyByWorkIds(['work-1'])).toEqual(new Set(['work-1']));
  });

  it('omits a work id whose only links are not isLegalFree', async () => {
    const repo = new InMemorySourceLinkRepository();
    repo.workIdByEditionId.set('edition-1', 'work-1');
    await repo.save(
      makeLink({
        id: 'link-2',
        type: 'buy',
        provider: ProviderId.create('amazon'),
        url: 'https://amazon.com/dp/xyz',
        rightsStatus: 'copyrighted',
      }),
    );

    expect(await repo.hasFreeCopyByWorkIds(['work-1'])).toEqual(new Set());
  });

  it('ignores a free link whose edition was never mapped to a work id', async () => {
    const repo = new InMemorySourceLinkRepository();
    await repo.save(makeLink()); // no workIdByEditionId entry for 'edition-1'

    expect(await repo.hasFreeCopyByWorkIds(['work-1'])).toEqual(new Set());
  });

  it('only reports the work ids actually asked about', async () => {
    const repo = new InMemorySourceLinkRepository();
    repo.workIdByEditionId.set('edition-1', 'work-1');
    await repo.save(makeLink());

    expect(await repo.hasFreeCopyByWorkIds(['work-2'])).toEqual(new Set());
  });
});
