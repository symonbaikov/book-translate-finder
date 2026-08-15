import { ConflictError } from '@golden/domain';
import { describe, expect, it } from 'vitest';
import { FixedClock } from '../../../domain/test/fakes/fixed-clock.js';
import { InMemoryIdempotencyStore } from '../../../domain/test/fakes/in-memory-idempotency-store.js';
import { InMemoryJobQueue } from '../../../domain/test/fakes/in-memory-job-queue.js';
import {
  EnqueueSourceSync,
  syncJobId,
  type EnqueueSourceSyncDeps,
} from '../../src/use-cases/enqueue-source-sync.use-case.js';

const NOW = new Date('2026-08-13T00:00:00Z');
const ENDPOINT = 'POST /api/sync/open-library';

function makeDeps() {
  const idempotencyStore = new InMemoryIdempotencyStore();
  const syncQueue = new InMemoryJobQueue();
  const clock = new FixedClock(NOW);
  const deps: EnqueueSourceSyncDeps = { idempotencyStore, syncQueue, clock };
  return { deps, idempotencyStore, syncQueue, clock };
}

describe('EnqueueSourceSync', () => {
  it('enqueues a deterministic job and returns queued', async () => {
    const { deps, syncQueue } = makeDeps();
    const useCase = new EnqueueSourceSync(deps);

    const result = await useCase.execute({
      source: 'open-library',
      query: 'War and Peace Tolstoy',
      idempotencyKey: 'key-1',
      endpoint: ENDPOINT,
    });

    expect(result).toEqual({
      status: 'queued',
      jobId: syncJobId('open-library', 'War and Peace Tolstoy', NOW),
      replayed: false,
    });
    expect(syncQueue.enqueued).toHaveLength(1);
    expect(syncQueue.enqueued[0]?.payload).toEqual({
      source: 'open-library',
      query: 'War and Peace Tolstoy',
    });
  });

  it('replays the stored response for a repeat call with the same key and body (docs/rules.md §2.4)', async () => {
    const { deps, syncQueue } = makeDeps();
    const useCase = new EnqueueSourceSync(deps);
    const input = {
      source: 'open-library',
      query: 'War and Peace Tolstoy',
      idempotencyKey: 'key-1',
      endpoint: ENDPOINT,
    };

    const first = await useCase.execute(input);
    const second = await useCase.execute(input);

    expect(second).toEqual({ ...first, replayed: true });
    expect(syncQueue.enqueued).toHaveLength(1);
  });

  it('throws ConflictError for the same key with a different body', async () => {
    const { deps } = makeDeps();
    const useCase = new EnqueueSourceSync(deps);

    await useCase.execute({
      source: 'open-library',
      query: 'War and Peace Tolstoy',
      idempotencyKey: 'key-1',
      endpoint: ENDPOINT,
    });

    await expect(
      useCase.execute({
        source: 'open-library',
        query: 'Anna Karenina Tolstoy',
        idempotencyKey: 'key-1',
        endpoint: ENDPOINT,
      }),
    ).rejects.toThrow(ConflictError);
  });

  it('treats the same key on a different endpoint as unrelated', async () => {
    const { deps, syncQueue } = makeDeps();
    const useCase = new EnqueueSourceSync(deps);

    await useCase.execute({
      source: 'open-library',
      query: 'War and Peace Tolstoy',
      idempotencyKey: 'key-1',
      endpoint: 'POST /api/sync/open-library',
    });
    await useCase.execute({
      source: 'google-books',
      query: 'War and Peace Tolstoy',
      idempotencyKey: 'key-1',
      endpoint: 'POST /api/sync/google-books',
    });

    expect(syncQueue.enqueued).toHaveLength(2);
  });

  it('produces the same jobId for repeated queries regardless of Idempotency-Key (BullMQ-level dedup)', () => {
    expect(syncJobId('open-library', 'War and Peace', NOW)).toBe(
      syncJobId('open-library', 'war   and PEACE', NOW),
    );
  });
});
