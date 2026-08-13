import { InvalidInputError } from '@btf/domain';
import type { EnqueueSourceSync, EnqueueSourceSyncOutput } from '@btf/application';
import { describe, expect, it, vi } from 'vitest';
import { SyncController } from './sync.controller.js';

function makeEnqueueSourceSync(output: EnqueueSourceSyncOutput): EnqueueSourceSync {
  return { execute: vi.fn(async () => output) } as unknown as EnqueueSourceSync;
}

describe('SyncController', () => {
  it('requires an Idempotency-Key header', async () => {
    const enqueueSourceSync = makeEnqueueSourceSync({
      status: 'queued',
      jobId: 'x',
      replayed: false,
    });
    const controller = new SyncController(enqueueSourceSync);

    await expect(
      controller.sync('open-library', { query: 'War and Peace' }, undefined),
    ).rejects.toThrow(InvalidInputError);
    expect(enqueueSourceSync.execute).not.toHaveBeenCalled();
  });

  it('rejects an empty query body', async () => {
    const enqueueSourceSync = makeEnqueueSourceSync({
      status: 'queued',
      jobId: 'x',
      replayed: false,
    });
    const controller = new SyncController(enqueueSourceSync);

    await expect(controller.sync('open-library', { query: '' }, 'key-1')).rejects.toThrow(
      InvalidInputError,
    );
  });

  it('builds the endpoint string from the concrete source and forwards everything', async () => {
    const enqueueSourceSync = makeEnqueueSourceSync({
      status: 'queued',
      jobId: 'sync-x',
      replayed: false,
    });
    const controller = new SyncController(enqueueSourceSync);

    const result = await controller.sync('open-library', { query: 'War and Peace' }, 'key-1');

    expect(enqueueSourceSync.execute).toHaveBeenCalledWith({
      source: 'open-library',
      query: 'War and Peace',
      idempotencyKey: 'key-1',
      endpoint: 'POST /api/sync/open-library',
    });
    expect(result).toEqual({ status: 'queued', jobId: 'sync-x', replayed: false });
  });
});
