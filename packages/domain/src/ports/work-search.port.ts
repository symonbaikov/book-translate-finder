export interface WorkSearchHit {
  id: string;
  originalTitle: string;
  author: string;
  firstPublishedYear: number | null;
  coverUrl: string | null;
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

export interface SubjectBrowseQuery {
  /** Subject heading, matched case-insensitively against a work's stored tags. */
  subject: string;
  /** Only works that have an edition in this language. Absent means any language. */
  language?: string | undefined;
  limit: number;
}

/**
 * Browsing by genre tag (docs/plan.md Phase 4.13). Separate from `search` because the two answer
 * different questions — one ranks by text similarity, the other filters by an exact tag — and
 * folding a tag filter into a fuzzy text search would rank works by how much their *title*
 * resembles the genre name.
 */
export interface SubjectBrowsePort {
  browseBySubject(query: SubjectBrowseQuery): Promise<WorkSearchHit[]>;
  /** The tags that actually have works behind them, most used first. */
  popularSubjects(limit: number): Promise<{ subject: string; workCount: number }[]>;
}
