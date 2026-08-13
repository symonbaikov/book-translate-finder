import type { ExternalRef } from '../value-objects/external-ref.js';

export type ExternalRefEntityType = 'work' | 'edition';

export interface ExternalRefRepository {
  findBySourceAndExternalId(
    ref: ExternalRef,
  ): Promise<{ entityType: ExternalRefEntityType; entityId: string } | null>;
  /** Upsert on `(source_name, external_id)` (docs/architecture.md §3.2) — the join idempotent sync relies on. */
  save(ref: ExternalRef, entityType: ExternalRefEntityType, entityId: string): Promise<void>;
}
