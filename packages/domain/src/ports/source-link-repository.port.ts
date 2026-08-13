import type { SourceLink } from '../entities/source-link.js';

export interface SourceLinkRepository {
  findByEditionId(editionId: string): Promise<SourceLink[]>;
  /** Upsert on `(edition_id, provider, type, url_hash)` (docs/architecture.md §3.2). */
  save(link: SourceLink): Promise<void>;
}
