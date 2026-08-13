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
