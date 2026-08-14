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
export interface RecommendBySubjectsQuery {
  /** Lowercased subject headings the reader has actually been reading. */
  subjects: readonly string[];
  limit: number;
}

export interface RecommendationHit extends WorkSearchHit {
  /** Which of the requested subjects this work shares — the reason it is being suggested. */
  matchedSubjects: string[];
}

export interface SubjectBrowsePort {
  /**
   * Works sharing the given subjects, most-overlapping first.
   *
   * Deliberately takes only subjects, never a reader identifier: recommendations here are
   * computed from a list of genres the browser sends, and the server keeps no profile of anyone
   * (docs/adr/0006-local-recommendations.md).
   */
  recommendBySubjects(query: RecommendBySubjectsQuery): Promise<RecommendationHit[]>;
  browseBySubject(query: SubjectBrowseQuery): Promise<WorkSearchHit[]>;
  /** The tags that actually have works behind them, most used first. */
  popularSubjects(limit: number): Promise<{ subject: string; workCount: number }[]>;
}
