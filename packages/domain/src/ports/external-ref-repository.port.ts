import type { ExternalRef } from '../value-objects/external-ref.js';

export type ExternalRefEntityType = 'work' | 'edition';

export interface ExternalRefRepository {
  findBySourceAndExternalId(
    ref: ExternalRef,
  ): Promise<{ entityType: ExternalRefEntityType; entityId: string } | null>;
  /** Upsert on `(source_name, external_id)` (docs/architecture.md §3.2) — the join idempotent sync relies on. */
  save(ref: ExternalRef, entityType: ExternalRefEntityType, entityId: string): Promise<void>;
  /**
   * Every distinct source that has ever contributed a ref to this entity — the only record of
   * "who touched this work/edition" available, since a sync stores merged field values, not raw
   * per-source snapshots. Used by `resolveFieldConflict` (docs/architecture.md §5) to decide
   * whether a resync from a lower-priority source than one already on record may overwrite
   * metadata fields.
   */
  findSourcesForEntity(entityId: string): Promise<string[]>;
  /**
   * The ids one source knows this entity by. Normally a single id, but the table's uniqueness is
   * on `(source_name, external_id)`, not on the entity, so two source records merged into one work
   * legitimately leave two — hence a list rather than a `string | null` that would silently pick
   * one. Used to reach sources keyed by an external id (`LocalizedDescriptionPort`).
   */
  findExternalIdsForEntity(entityId: string, sourceName: string): Promise<string[]>;
}
