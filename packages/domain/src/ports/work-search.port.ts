export interface WorkSearchHit {
  id: string;
  originalTitle: string;
  author: string;
  firstPublishedYear: number | null;
}

/**
 * Full-text search over already-synced works (docs/architecture.md §4 `GET /api/search`).
 * Deliberately separate from `WorkRepository` (docs/rules.md §1 ISP) — ranking is a
 * Postgres-specific concern (trigram similarity, docs/architecture.md §3.3), the port only
 * promises an already-ranked result set, not how ranking works.
 */
export interface WorkSearchPort {
  search(query: string, limit: number): Promise<WorkSearchHit[]>;
}
