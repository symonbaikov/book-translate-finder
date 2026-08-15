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

  /**
   * `SourceLink` only carries an `editionId`, not a work id — this fake has no edition
   * repository to resolve one through, so tests that care about `hasFreeCopyByWorkIds`
   * populate this map themselves (`editionId -> workId`). Left empty, the method just
   * reports no free copies for anything, which is correct for every test that doesn't touch it.
   */
  readonly workIdByEditionId = new Map<string, string>();

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

  async hasFreeCopyByWorkIds(workIds: readonly string[]): Promise<Set<string>> {
    const wanted = new Set(workIds);
    const found = new Set<string>();
    for (const link of this.byId.values()) {
      if (!link.isLegalFree) continue;
      const workId = this.workIdByEditionId.get(link.editionId);
      if (workId && wanted.has(workId)) found.add(workId);
    }
    return found;
  }

  async findFreeDownloadsByEditionIds(
    editionIds: readonly string[],
  ): Promise<Map<string, SourceLink[]>> {
    const wanted = new Set(editionIds);
    const found = new Map<string, SourceLink[]>();
    for (const link of this.byId.values()) {
      if (!wanted.has(link.editionId)) continue;
      if (!link.isLegalFree) continue;
      if (link.type !== 'download' && link.type !== 'listen') continue;
      const forEdition = found.get(link.editionId) ?? [];
      forEdition.push(link);
      found.set(link.editionId, forEdition);
    }
    return found;
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
