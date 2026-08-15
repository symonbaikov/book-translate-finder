import { and, eq } from 'drizzle-orm';
import type { IdempotencyRecord, IdempotencyStore } from '@golden/domain';
import type { Db } from '../db/client.js';
import { resolveDb } from '../db/transaction-context.js';
import { idempotencyKey } from '../db/schema.js';

export class PgIdempotencyStore implements IdempotencyStore {
  constructor(private readonly db: Db) {}

  /** Resolves to the ambient transaction if PgUnitOfWork.runInTransaction is active, else the pool. */
  private get q() {
    return resolveDb(this.db);
  }

  async find(key: string, endpoint: string): Promise<IdempotencyRecord | null> {
    const [row] = await this.q
      .select()
      .from(idempotencyKey)
      .where(and(eq(idempotencyKey.key, key), eq(idempotencyKey.endpoint, endpoint)))
      .limit(1);
    if (!row) return null;
    return {
      key: row.key,
      endpoint: row.endpoint,
      requestHash: row.requestHash,
      responseBody: row.responseBody,
      statusCode: row.statusCode,
      createdAt: row.createdAt,
      expiresAt: row.expiresAt,
    };
  }

  async save(record: IdempotencyRecord): Promise<void> {
    await this.q
      .insert(idempotencyKey)
      .values({
        key: record.key,
        endpoint: record.endpoint,
        requestHash: record.requestHash,
        responseBody: record.responseBody,
        statusCode: record.statusCode,
        createdAt: record.createdAt,
        expiresAt: record.expiresAt,
      })
      .onConflictDoUpdate({
        target: [idempotencyKey.key, idempotencyKey.endpoint],
        set: {
          requestHash: record.requestHash,
          responseBody: record.responseBody,
          statusCode: record.statusCode,
          createdAt: record.createdAt,
          expiresAt: record.expiresAt,
        },
      });
  }
}
