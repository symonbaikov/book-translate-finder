import type {
  ExternalRefEntityType,
  ExternalRefRepository,
} from '../../src/ports/external-ref-repository.port.js';
import type { ExternalRef } from '../../src/value-objects/external-ref.js';

interface StoredRef {
  sourceName: string;
  externalId: string;
  entityType: ExternalRefEntityType;
  entityId: string;
}

export class InMemoryExternalRefRepository implements ExternalRefRepository {
  private readonly byKey = new Map<string, StoredRef>();

  private key(ref: ExternalRef): string {
    return `${ref.sourceName}|${ref.externalId}`;
  }

  async findBySourceAndExternalId(
    ref: ExternalRef,
  ): Promise<{ entityType: ExternalRefEntityType; entityId: string } | null> {
    const stored = this.byKey.get(this.key(ref));
    return stored ? { entityType: stored.entityType, entityId: stored.entityId } : null;
  }

  async save(ref: ExternalRef, entityType: ExternalRefEntityType, entityId: string): Promise<void> {
    // Upsert on (source_name, external_id) (docs/architecture.md §3.2) — re-saving the same ref
    // just overwrites what it points to, never adds a second row.
    this.byKey.set(this.key(ref), {
      sourceName: ref.sourceName,
      externalId: ref.externalId,
      entityType,
      entityId,
    });
  }

  async findSourcesForEntity(entityId: string): Promise<string[]> {
    return [
      ...new Set(
        [...this.byKey.values()].filter((r) => r.entityId === entityId).map((r) => r.sourceName),
      ),
    ];
  }

  async findExternalIdsForEntity(entityId: string, sourceName: string): Promise<string[]> {
    return [...this.byKey.values()]
      .filter((r) => r.entityId === entityId && r.sourceName === sourceName)
      .map((r) => r.externalId);
  }
}
