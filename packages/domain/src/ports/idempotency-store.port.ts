export interface IdempotencyRecord {
  key: string;
  endpoint: string;
  requestHash: string;
  responseBody: unknown;
  statusCode: number;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Backs the `Idempotency-Key` handling on mutating endpoints (docs/rules.md §2.4): same key +
 * same request hash replays the stored response; same key + different hash is a conflict the
 * use case turns into `409` — this port only stores and retrieves, it doesn't decide that.
 */
export interface IdempotencyStore {
  find(key: string, endpoint: string): Promise<IdempotencyRecord | null>;
  save(record: IdempotencyRecord): Promise<void>;
}
