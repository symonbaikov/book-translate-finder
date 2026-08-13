import { sql } from 'drizzle-orm';
import type { WorkSearchHit, WorkSearchPort } from '@btf/domain';
import type { Db } from '../db/client.js';

/**
 * Trigram-ranked search (docs/architecture.md §3.3/§4 `GET /api/search`) over `work.original_title`
 * and `work.author`, both covered by GIN `gin_trgm_ops` indexes from the Phase 1.2 migration.
 * Raw SQL, not the query builder: Drizzle has no first-class `similarity()`/`gin_trgm_ops` support
 * (same reason the indexes themselves are hand-written — see schema.ts).
 *
 * `ILIKE` is OR'd in alongside the trigram match because trigram similarity degrades on very
 * short queries (1-2 word titles, single-word author searches) where a plain substring match is
 * still the right answer but scores below any reasonable similarity threshold.
 *
 * Never wrapped in `resolveDb`/an ambient `UnitOfWork` transaction — `SearchWorks` (the only
 * caller) is a pure read path, so this owns its own short-lived transaction below purely to make
 * `SET LOCAL` safe on a pooled connection, not for cross-repository atomicity.
 */
export class PgWorkSearchAdapter implements WorkSearchPort {
  constructor(private readonly db: Db) {}

  async search(query: string, limit: number): Promise<WorkSearchHit[]> {
    // pg_trgm's own recommended default (`similarity_threshold` GUC). Found live at 0.1: an
    // unrelated title ("The Little Prince...") matched "The Hobbit" at 0.1025 similarity purely
    // from the shared word "The" — 0.1 was too permissive to be a meaningful relevance cutoff.
    const threshold = 0.3;
    const likePattern = `%${query}%`;

    // The WHERE clause uses the `%` trigram operator, not `similarity(col, query) > threshold` —
    // load-tested live at 50k works/150k editions (docs/plan.md §Фаза 2): the function-call form
    // is NOT accelerated by the GIN `gin_trgm_ops` indexes at all (only the `%`/`LIKE`/`ILIKE`
    // *operators* are), so it silently fell back to a full sequential scan — 157ms and climbing
    // with table size. `%`'s implicit threshold comes from the `pg_trgm.similarity_threshold`
    // GUC, set with `SET LOCAL` inside a transaction so it never leaks onto a pooled connection's
    // next, unrelated query. Cut execution to 41ms on the same 50k-row table (bitmap index scan
    // across both trigram indexes, confirmed via EXPLAIN ANALYZE) — the ranking `similarity()`
    // calls in SELECT/ORDER BY stay function calls, which is fine: by then the WHERE clause has
    // already narrowed the row set the ranking runs over.
    const rows = await this.db.transaction(async (tx) => {
      // `SET LOCAL` doesn't support bind parameters (Postgres rejects `$1` there outright) — safe
      // to inline as a literal since `threshold` is a fixed constant above, never user input.
      await tx.execute(sql.raw(`SET LOCAL pg_trgm.similarity_threshold = ${threshold}`));
      return tx.execute<{
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
        WHERE "original_title" % ${query}
           OR "author" % ${query}
           OR "original_title" ILIKE ${likePattern}
           OR "author" ILIKE ${likePattern}
        ORDER BY "rank" DESC
        LIMIT ${limit}
      `);
    });

    return [...rows].map((row) => ({
      id: row.id,
      originalTitle: row.originalTitle,
      author: row.author,
      firstPublishedYear: row.firstPublishedYear,
    }));
  }
}
