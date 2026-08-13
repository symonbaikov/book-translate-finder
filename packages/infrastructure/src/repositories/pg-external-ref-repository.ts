import { and, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import type { ExternalRefEntityType, ExternalRefRepository } from '@btf/domain';
import type { ExternalRef } from '@btf/domain';
import type { Db } from '../db/client.js';
import { externalRef } from '../db/schema.js';

function isEntityType(value: string): value is ExternalRefEntityType {
  return value === 'work' || value === 'edition';
}

export class PgExternalRefRepository implements ExternalRefRepository {
  constructor(private readonly db: Db) {}

  async findBySourceAndExternalId(
    ref: ExternalRef,
  ): Promise<{ entityType: ExternalRefEntityType; entityId: string } | null> {
    const [row] = await this.db
      .select()
      .from(externalRef)
      .where(
        and(eq(externalRef.sourceName, ref.sourceName), eq(externalRef.externalId, ref.externalId)),
      )
      .limit(1);
    if (!row) return null;
    if (!isEntityType(row.entityType)) {
      throw new Error(`Corrupt external_ref row: unknown entity_type ${row.entityType}`);
    }
    return { entityType: row.entityType, entityId: row.entityId };
  }

  async save(ref: ExternalRef, entityType: ExternalRefEntityType, entityId: string): Promise<void> {
    await this.db
      .insert(externalRef)
      .values({
        // This is the one repository where the entity has no application-visible id of its own
        // to preserve across a conflict (docs/rules.md §2.2) — `external_ref` rows aren't
        // referenced by id anywhere else, so a fresh one per insert attempt is fine; infrastructure
        // is allowed to touch `node:crypto` directly (only domain/application are restricted,
        // see eslint.config.mjs).
        id: randomUUID(),
        sourceName: ref.sourceName,
        externalId: ref.externalId,
        entityType,
        entityId,
      })
      .onConflictDoUpdate({
        target: [externalRef.sourceName, externalRef.externalId],
        set: { entityType, entityId },
      });
  }
}
