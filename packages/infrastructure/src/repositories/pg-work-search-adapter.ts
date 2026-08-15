import { sql } from 'drizzle-orm';
import { romanizeCyrillicQuery, type WorkSearchHit, type WorkSearchPort } from '@golden/domain';
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
    const primary = await this.runSearch(query, limit);

    // Cross-script fallback (found live in Phase 3): Open Library stores Russian editions under
    // romanized titles ("Voina i mir"), so a Cyrillic query shares zero trigrams with anything
    // stored under that spelling and finds nothing there. Retry with the romanized form whenever
    // the query contains Cyrillic — see `romanize-query.ts` for why it is its own function and
    // not part of the domain's normalizeText.
    const romanized = romanizeCyrillicQuery(query);
    if (romanized === null) return primary;

    // Run unconditionally, not only when `primary` came back empty: a *mixed* series — some
    // works stored in Cyrillic, others in Latin, e.g. «Метро 2033»/«Метро 2034» next to the
    // Latin-titled "Metro 2035" — was invisible to a query for the series name alone, because
    // "Метро" already finds the two Cyrillic ones and the old early return never tried the
    // romanized pass at all. Both result sets are merged (deduplicated by work id, keeping
    // whichever side ranked a given work higher) rather than one replacing the other.
    const fallback = await this.runSearch(romanized, limit);
    if (primary.length === 0) return fallback;
    if (fallback.length === 0) return primary;
    return this.mergeByRank(primary, fallback, limit);
  }

  private mergeByRank(a: WorkSearchHit[], b: WorkSearchHit[], limit: number): WorkSearchHit[] {
    const byId = new Map<string, WorkSearchHit>();
    for (const hit of [...a, ...b]) {
      const existing = byId.get(hit.id);
      if (!existing || (hit.rank ?? 0) > (existing.rank ?? 0)) byId.set(hit.id, hit);
    }
    return [...byId.values()].sort((x, y) => (y.rank ?? 0) - (x.rank ?? 0)).slice(0, limit);
  }

  private async runSearch(query: string, limit: number): Promise<WorkSearchHit[]> {
    // pg_trgm's own recommended default (`similarity_threshold` GUC). Found live at 0.1: an
    // unrelated title ("The Little Prince...") matched "The Hobbit" at 0.1025 similarity purely
    // from the shared word "The" — 0.1 was too permissive to be a meaningful relevance cutoff.
    const threshold = 0.3;
    /**
     * A higher bar for the edition-title arm, because reaching a work through one of its
     * editions is weaker evidence than matching the work's own title or author: the edition
     * title is in another language and belongs to one printing, so a partial overlap says much
     * less about what the reader meant.
     *
     * Measured against this instance's own data, which is where the number comes from — «Обитель
     * Прилепин» returned *La chartreuse de Parme* by Stendhal, because its Russian edition is
     * «Пармская обитель» and one shared word scored 0.360, over the general 0.3 bar, while the
     * work itself scored 0.000 against the query. The matches this arm exists to keep score far
     * higher: «Мастер и Маргарита» hits its edition at 1.000, and «Пикник на обочине Стругацкие»
     * reaches *Roadside Picnic* through «Пикник на обочине» at 0.621.
     *
     * Applied as an explicit `similarity()` call *after* the `%` operator rather than instead of
     * it, so the GIN index still narrows the rows first — see the note below on why only the
     * operator is index-accelerated.
     */
    const editionTitleThreshold = 0.5;
    const likePattern = `%${query}%`;

    // The WHERE clause uses the `%` trigram operator, not `similarity(col, query) > threshold` —
    // load-tested live at 50k works/150k editions (docs/plan.md §Phase 2): the function-call form
    // is NOT accelerated by the GIN `gin_trgm_ops` indexes at all (only the `%`/`LIKE`/`ILIKE`
    // *operators* are), so it silently fell back to a full sequential scan — 157ms and climbing
    // with table size. `%`'s implicit threshold comes from the `pg_trgm.similarity_threshold`
    // GUC, set with `SET LOCAL` inside a transaction so it never leaks onto a pooled connection's
    // next, unrelated query. Cut execution to 41ms on the same 50k-row table (bitmap index scan
    // across both trigram indexes, confirmed via EXPLAIN ANALYZE) — the ranking `similarity()`
    // calls in SELECT/ORDER BY stay function calls, which is fine: by then the WHERE clause has
    // already narrowed the row set the ranking runs over.
    //
    // Edition titles are matched too (EXISTS + the `edition_title_trgm_idx` from migration 0003):
    // found live in Phase 3 — a work stored under its original-language title (e.g. «Мастер и
    // Маргарита») was unfindable by the English title its translations carry ("Master and
    // Margarita"), even though those edition titles were sitting in our own database. Worse, the
    // backfill "succeeded" by deduplicating into that same work, so the search stayed `pending`
    // forever — a cross-language dead loop.
    const rows = await this.db.transaction(async (tx) => {
      // `SET LOCAL` doesn't support bind parameters (Postgres rejects `$1` there outright) — safe
      // to inline as a literal since `threshold` is a fixed constant above, never user input.
      await tx.execute(sql.raw(`SET LOCAL pg_trgm.similarity_threshold = ${threshold}`));
      return tx.execute<{
        id: string;
        originalTitle: string;
        author: string;
        firstPublishedYear: number | null;
        coverUrl: string | null;
        rank: number | string;
      }>(sql`
        SELECT
          "id",
          "original_title" AS "originalTitle",
          "author",
          "first_published_year" AS "firstPublishedYear",
          "cover_url" AS "coverUrl",
          GREATEST(
            similarity("original_title", ${query}),
            similarity("author", ${query}),
            -- Title and author together, because readers type both and matching both is stronger
            -- evidence than matching either. Taking only the maximum of the separate arms threw
            -- that away: for "Shantaram Gregori Devid Roberts" the author arm scores 0.459 for
            -- *every* book by Gregory David Roberts, so *Shantaram* and *The Mountain Shadow*
            -- tied and the order between them was arbitrary — the reader got the wrong novel.
            -- On the combined text they score 0.730 and 0.396.
            similarity("original_title" || ' ' || "author", ${query}),
            COALESCE((
              SELECT MAX(similarity(e."title", ${query}))
              FROM "edition" e
              WHERE e."work_id" = "work"."id"
                AND (
                  (e."title" % ${query} AND similarity(e."title", ${query}) >= ${editionTitleThreshold})
                  OR e."title" ILIKE ${likePattern}
                )
            ), 0)
          ) AS "rank"
        FROM "work"
        WHERE "original_title" % ${query}
           OR "author" % ${query}
           OR "original_title" ILIKE ${likePattern}
           OR "author" ILIKE ${likePattern}
           OR EXISTS (
             SELECT 1 FROM "edition" e
             WHERE e."work_id" = "work"."id"
               AND (
                 (e."title" % ${query} AND similarity(e."title", ${query}) >= ${editionTitleThreshold})
                 OR e."title" ILIKE ${likePattern}
               )
           )
        ORDER BY "rank" DESC
        LIMIT ${limit}
      `);
    });

    return [...rows].map((row) => ({
      id: row.id,
      originalTitle: row.originalTitle,
      author: row.author,
      firstPublishedYear: row.firstPublishedYear,
      coverUrl: row.coverUrl,
      // `real` arrives over the wire as a string from some driver paths; the port promises a number.
      rank: Number(row.rank),
    }));
  }
}
