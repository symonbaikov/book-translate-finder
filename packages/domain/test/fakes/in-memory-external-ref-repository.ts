import type {
  ExternalRefEntityType,
  ExternalRefRepository,
} from '../../src/ports/external-ref-repository.port.js';
import type { ExternalRef } from '../../src/value-objects/external-ref.js';

interface StoredRef {
  entityType: ExternalRefEntityType;
  entityId: string;
}

export class InMemoryExternalRefRepository implements ExternalRefRepository {
  private readonly byKey = new Map<string, StoredRef>();

  private key(ref: ExternalRef): string {
    return `${ref.sourceName}|${ref.externalId}`;
  }

  async findBySourceAndExternalId(ref: ExternalRef): Promise<StoredRef | null> {
    return this.byKey.get(this.key(ref)) ?? null;
  }

  async save(ref: ExternalRef, entityType: ExternalRefEntityType, entityId: string): Promise<void> {
    // Upsert on (source_name, external_id) (docs/architecture.md §3.2) — re-saving the same ref
    // just overwrites what it points to, never adds a second row.
    this.byKey.set(this.key(ref), { entityType, entityId });
  }
}
