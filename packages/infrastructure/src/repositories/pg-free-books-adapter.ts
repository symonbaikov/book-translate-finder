import { sql } from 'drizzle-orm';
import type { FreeBookHit, FreeBooksPort, FreeBooksQuery, FreeBooksResult } from '@golden/domain';
import type { Db } from '../db/client.js';

interface FreeBookRow extends Record<string, unknown> {
  id: string;
  original_title: string;
  author: string;
  first_published_year: number | null;
  cover_url: string | null;
  formats: (string | null)[] | null;
  total: string | number;
}

/**
 * The free shelf, read straight off `source_link.is_legal_free`.
 *
 * The flag is the whole filter, and that is the point: it is set by `LinkPolicy` when a link is
 * admitted and re-checked by a storage CHECK, so this query cannot produce a book whose free copy
 * the policy would have refused (docs/legal-policy.md). Nothing here re-derives "is this free" —
 * a second opinion on that question is exactly the bug that would put an unlawful link on a page.
 *
 * Raw SQL because the shape needs a grouped join, an aggregate over one joined column and a total
 * in the same round trip; Drizzle's builder expresses that considerably less clearly than this.
 */
export class PgFreeBooksAdapter implements FreeBooksPort {
  constructor(private readonly db: Db) {}

  async listFreeBooks(query: FreeBooksQuery): Promise<FreeBooksResult> {
    const language = query.language?.trim().toLowerCase();

    // `count(*) OVER ()` runs after GROUP BY and before LIMIT, so it counts matching *works* —
    // one round trip for the page and the total instead of two, and no chance of the two
    // disagreeing because a sync landed between them.
    const rows = await this.db.execute<FreeBookRow>(sql`
      SELECT w.id, w.original_title, w.author, w.first_published_year, w.cover_url,
             -- FILTER rather than dropping the nulls afterwards: a link with no file leaves a
             -- NULL in the aggregate, and the driver hands that back as the *string* "null" —
             -- which would have shown up on a card as a format called null (caught by a test).
             array_agg(DISTINCT sl.format) FILTER (WHERE sl.format IS NOT NULL) AS formats,
             count(*) OVER () AS total
      FROM work w
      JOIN edition e ON e.work_id = w.id
      -- Both conditions carry weight: is_legal_free is what the link policy decided, and the type
      -- is what the reader gets. A public domain book behind a library borrow queue passes the
      -- first and fails the second, and this shelf promises the second.
      JOIN source_link sl
        ON sl.edition_id = e.id
       AND sl.is_legal_free = true
       AND sl.type IN ('download', 'listen')
      ${language ? sql`WHERE e.language = ${language}` : sql``}
      GROUP BY w.id
      -- Most-published first, as everywhere else on this site: edition count is the one popularity
      -- signal open data actually states, rather than a ranking this project invented. Year and
      -- title break ties so paging through the shelf is stable — an unstable ORDER BY with OFFSET
      -- silently shows some books twice and hides others.
      ORDER BY (SELECT count(*) FROM edition e2 WHERE e2.work_id = w.id) DESC,
               w.first_published_year DESC NULLS LAST,
               w.original_title ASC,
               w.id ASC
      LIMIT ${query.limit} OFFSET ${query.offset}
    `);

    const first = rows[0];
    return {
      books: rows.map(toHit),
      total: first ? Number(first.total) : 0,
    };
  }
}

function toHit(row: FreeBookRow): FreeBookHit {
  return {
    id: row.id,
    originalTitle: row.original_title,
    author: row.author,
    firstPublishedYear: row.first_published_year,
    coverUrl: row.cover_url,
    // A buy/borrow link has no format and a free reading page often has none either, so the
    // aggregate legitimately contains NULLs — dropped here rather than shown as an empty chip.
    formats: [
      ...new Set(
        (row.formats ?? [])
          .filter((format): format is string => typeof format === 'string')
          .map((format) => format.trim().toLowerCase())
          .filter(Boolean),
      ),
    ].sort(),
  };
}
