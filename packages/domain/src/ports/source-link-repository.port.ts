import type { SourceLink } from '../entities/source-link.js';

export interface SourceLinkRepository {
  findByEditionId(editionId: string): Promise<SourceLink[]>;
  /**
   * Link counts for a batch of editions in one round trip — editions absent from the result have
   * zero links. Feeds the edition list's "has legal sources" signal (Phase 3 UX finding: the
   * product's core promise is "where to get the text legally", so which editions have links must
   * be visible on the list itself, not discoverable only by expanding editions one at a time).
   */
  countByEditionIds(editionIds: readonly string[]): Promise<Map<string, number>>;
  /** Upsert on `(edition_id, provider, type, url_hash)` (docs/architecture.md §3.2). */
  save(link: SourceLink): Promise<void>;
}
