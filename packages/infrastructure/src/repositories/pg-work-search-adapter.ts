import { sql } from 'drizzle-orm';
import type { WorkSearchHit, WorkSearchPort } from '@btf/domain';
import type { Db } from '../db/client.js';
import { resolveDb } from '../db/transaction-context.js';

/**
 * Trigram-ranked search (docs/architecture.md §3.3/§4 `GET /api/search`) over `work.original_title`
 * and `work.author`, both covered by GIN `gin_trgm_ops` indexes from the Phase 1.2 migration.
 * Raw SQL, not the query builder: Drizzle has no first-class `similarity()`/`gin_trgm_ops` support
 * (same reason the indexes themselves are hand-written — see schema.ts).
 *
 * `ILIKE` is OR'd in alongside `similarity()` because trigram similarity degrades on very short
 * queries (1-2 word titles, single-word author searches) where a plain substring match is still
 * the right answer but scores below any reasonable similarity threshold.
 */
export class PgWorkSearchAdapter implements WorkSearchPort {
  constructor(private readonly db: Db) {}

  private get q() {
    return resolveDb(this.db);
  }

  async search(query: string, limit: number): Promise<WorkSearchHit[]> {
    // pg_trgm's own recommended default (`similarity_threshold` GUC). Found live at 0.1: an
    // unrelated title ("The Little Prince...") matched "The Hobbit" at 0.1025 similarity purely
    // from the shared word "The" — 0.1 was too permissive to be a meaningful relevance cutoff.
    const threshold = 0.3;
    const likePattern = `%${query}%`;

    const rows = await this.q.execute<{
      id: string;
      originalTitle: string;
      author: string;
      firstPublishedYear: number | null;
    }>(sql`
      SELECT
        "id",
        "original_title" AS "originalTitle",
        "author",
        "first_published_year" AS "firstPublishedYear",
        GREATEST(similarity("original_title", ${query}), similarity("author", ${query})) AS "rank"
      FROM "work"
      WHERE similarity("original_title", ${query}) > ${threshold}
         OR similarity("author", ${query}) > ${threshold}
         OR "original_title" ILIKE ${likePattern}
         OR "author" ILIKE ${likePattern}
      ORDER BY "rank" DESC
      LIMIT ${limit}
    `);

    return [...rows].map((row) => ({
      id: row.id,
      originalTitle: row.originalTitle,
      author: row.author,
      firstPublishedYear: row.firstPublishedYear,
    }));
  }
}
