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
  /**
   * Work ids that have at least one edition with an `isLegalFree` link, in one round trip.
   * Feeds the search results "free to download" filter — the same "does this work have a
   * free copy" question `GetFeaturedBooks.hasFreeCopy` answers per-work, batched here for a
   * results list instead of one round trip per edition.
   */
  hasFreeCopyByWorkIds(workIds: readonly string[]): Promise<Set<string>>;
  /**
   * The links that hand a reader the text (or the audio) for nothing — `download` and `listen`,
   * free and from an allowlisted provider — for a batch of editions in one round trip. Editions
   * absent from the result have none.
   *
   * Deliberately *not* "every link with `isLegalFree`": that flag is derived from rights status
   * alone, so a `borrow` link to a public domain scan carries it too, and a place in a library
   * queue is not a copy in your hands. The edition list uses this to put the editions a reader can
   * open right now at the top, and that promise has to be exact.
   */
  findFreeDownloadsByEditionIds(editionIds: readonly string[]): Promise<Map<string, SourceLink[]>>;
  /** Upsert on `(edition_id, provider, type, url_hash)` (docs/architecture.md §3.2). */
  save(link: SourceLink): Promise<void>;
}
