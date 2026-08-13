import { SourceLink } from '../../src/entities/source-link.js';
import type { SourceLinkRepository } from '../../src/ports/source-link-repository.port.js';

function compositeKey(
  link: Pick<SourceLink, 'editionId' | 'provider' | 'type' | 'urlHash'>,
): string {
  return `${link.editionId}|${link.provider.value}|${link.type}|${link.urlHash}`;
}

export class InMemorySourceLinkRepository implements SourceLinkRepository {
  private readonly byId = new Map<string, SourceLink>();
  private readonly idByCompositeKey = new Map<string, string>();

  async findByEditionId(editionId: string): Promise<SourceLink[]> {
    return [...this.byId.values()].filter((l) => l.editionId === editionId);
  }

  async countByEditionIds(editionIds: readonly string[]): Promise<Map<string, number>> {
    const wanted = new Set(editionIds);
    const counts = new Map<string, number>();
    for (const link of this.byId.values()) {
      if (!wanted.has(link.editionId)) continue;
      counts.set(link.editionId, (counts.get(link.editionId) ?? 0) + 1);
    }
    return counts;
  }

  async save(link: SourceLink): Promise<void> {
    const key = compositeKey(link);
    const existingId = this.idByCompositeKey.get(key);

    if (existingId && existingId !== link.id) {
      // Upsert on (edition_id, provider, type, url_hash) (docs/architecture.md §3.2): keep the
      // pre-existing id, refresh only the fields that can legitimately change on re-verification.
      const merged = SourceLink.rehydrateFromStorage({
        id: existingId,
        editionId: link.editionId,
        type: link.type,
        url: link.url,
        urlHash: link.urlHash,
        provider: link.provider,
        rightsStatus: link.rightsStatus,
        isLegalFree: link.isLegalFree,
        verifiedAt: link.verifiedAt,
      });
      this.byId.set(existingId, merged);
      return;
    }

    this.byId.set(link.id, link);
    this.idByCompositeKey.set(key, link.id);
  }
}
