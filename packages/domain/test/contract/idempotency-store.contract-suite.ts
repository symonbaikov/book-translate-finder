import { describe, expect, it } from 'vitest';
import type {
  IdempotencyRecord,
  IdempotencyStore,
} from '../../src/ports/idempotency-store.port.js';

export function runIdempotencyStoreContractTests(createStore: () => IdempotencyStore): void {
  const makeRecord = (overrides: Partial<IdempotencyRecord> = {}): IdempotencyRecord => ({
    key: 'client-key-1',
    endpoint: 'POST /api/sync/open-library',
    requestHash: 'hash-a',
    responseBody: { status: 'accepted' },
    statusCode: 202,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    expiresAt: new Date('2026-01-02T00:00:00Z'),
    ...overrides,
  });

  describe('IdempotencyStore contract', () => {
    it('returns null for a key that was never saved', async () => {
      const store = createStore();
      expect(await store.find('missing', 'POST /api/sync/open-library')).toBeNull();
    });

    it('save() then find() returns the stored record — replaying a request returns the same response', async () => {
      const store = createStore();
      const record = makeRecord();
      await store.save(record);

      const found = await store.find(record.key, record.endpoint);
      expect(found?.responseBody).toEqual({ status: 'accepted' });
      expect(found?.statusCode).toBe(202);
    });

    it('the same key under a different endpoint is a distinct record (docs/rules.md §2.4)', async () => {
      const store = createStore();
      await store.save(makeRecord({ endpoint: 'POST /api/sync/open-library' }));
      expect(await store.find('client-key-1', 'POST /api/sync/google-books')).toBeNull();
    });

    it('re-saving the same (key, endpoint) overwrites rather than duplicating', async () => {
      const store = createStore();
      await store.save(makeRecord({ requestHash: 'hash-a' }));
      await store.save(makeRecord({ requestHash: 'hash-a', statusCode: 200 }));

      const found = await store.find('client-key-1', 'POST /api/sync/open-library');
      expect(found?.statusCode).toBe(200);
    });
  });
}
