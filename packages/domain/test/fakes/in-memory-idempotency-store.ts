import type {
  IdempotencyRecord,
  IdempotencyStore,
} from '../../src/ports/idempotency-store.port.js';

export class InMemoryIdempotencyStore implements IdempotencyStore {
  private readonly byKey = new Map<string, IdempotencyRecord>();

  private key(key: string, endpoint: string): string {
    return `${key}|${endpoint}`;
  }

  async find(key: string, endpoint: string): Promise<IdempotencyRecord | null> {
    return this.byKey.get(this.key(key, endpoint)) ?? null;
  }

  async save(record: IdempotencyRecord): Promise<void> {
    // Upsert on (key, endpoint) (docs/architecture.md §3.2) — a retried save with the same pair
    // just overwrites the stored response rather than erroring or duplicating.
    this.byKey.set(this.key(record.key, record.endpoint), record);
  }
}
