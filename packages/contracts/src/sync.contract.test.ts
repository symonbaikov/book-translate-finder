import { describe, expect, it } from 'vitest';
import { SyncParamsSchema, SyncRequestBodySchema, SyncResponseSchema } from './sync.contract.js';

describe('SyncParamsSchema', () => {
  it('accepts a source name', () => {
    expect(SyncParamsSchema.safeParse({ source: 'open-library' }).success).toBe(true);
  });

  it('rejects an empty source', () => {
    expect(SyncParamsSchema.safeParse({ source: '' }).success).toBe(false);
  });
});

describe('SyncRequestBodySchema', () => {
  it('accepts a query string', () => {
    expect(SyncRequestBodySchema.safeParse({ query: 'War and Peace Tolstoy' }).success).toBe(true);
  });

  it('rejects an empty query', () => {
    expect(SyncRequestBodySchema.safeParse({ query: '' }).success).toBe(false);
  });
});

describe('SyncResponseSchema', () => {
  it('accepts a freshly queued response', () => {
    const result = SyncResponseSchema.safeParse({
      status: 'queued',
      jobId: 'sync-open-library-abc123-2026-08-13',
      replayed: false,
    });
    expect(result.success).toBe(true);
  });

  it('accepts a replayed response (Idempotency-Key hit, docs/rules.md §2.4)', () => {
    const result = SyncResponseSchema.safeParse({
      status: 'queued',
      jobId: 'sync-open-library-abc123-2026-08-13',
      replayed: true,
    });
    expect(result.success).toBe(true);
  });

  it('rejects a response missing the replayed flag', () => {
    const result = SyncResponseSchema.safeParse({
      status: 'queued',
      jobId: 'sync-open-library-abc123-2026-08-13',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown status', () => {
    const result = SyncResponseSchema.safeParse({
      status: 'synced',
      jobId: 'x',
      replayed: false,
    });
    expect(result.success).toBe(false);
  });
});
