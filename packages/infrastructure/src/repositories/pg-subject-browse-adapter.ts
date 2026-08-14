import { sql } from 'drizzle-orm';
import type {
  RecommendationHit,
  RecommendBySubjectsQuery,
  SubjectBrowsePort,
  SubjectBrowseQuery,
  WorkSearchHit,
} from '@btf/domain';
import type { Db } from '../db/client.js';

interface RecommendRow extends SubjectRow {
  matched: string[];
}

interface SubjectRow extends Record<string, unknown> {
  id: string;
  original_title: string;
  author: string;
  first_published_year: number | null;
  cover_url: string | null;
}

/**
 * Browsing by genre tag, over `work.subjects` (a JSONB array of contributor-written headings).
 *
 * Matching is case-insensitive on the whole heading, not a substring: "fiction" must not sweep in
 * "science fiction" and "historical fiction" as if they were the same shelf. Raw SQL because
 * Drizzle has no first-class JSONB-array containment with a case fold.
 */
export class PgSubjectBrowseAdapter implements SubjectBrowsePort {
  constructor(private readonly db: Db) {}

  async browseBySubject(query: SubjectBrowseQuery): Promise<WorkSearchHit[]> {
    const subject = query.subject.trim().toLowerCase();
    if (!subject) return [];

    // The language filter is an EXISTS over editions rather than a join: a work with forty
    // editions in that language must appear once, not forty times.
    const rows = await this.db.execute<SubjectRow>(sql`
      SELECT w.id, w.original_title, w.author, w.first_published_year, w.cover_url
      FROM work w
      WHERE EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(w.subjects) AS s(value)
        WHERE lower(s.value) = ${subject}
      )
      ${
        query.language
          ? sql`AND EXISTS (SELECT 1 FROM edition e WHERE e.work_id = w.id AND e.language = ${query.language})`
          : sql``
      }
      ORDER BY w.first_published_year DESC NULLS LAST, w.original_title ASC
      LIMIT ${query.limit}
    `);

    return rows.map((row) => ({
      id: row.id,
      originalTitle: row.original_title,
      author: row.author,
      firstPublishedYear: row.first_published_year,
      coverUrl: row.cover_url,
    }));
  }

  async recommendBySubjects(query: RecommendBySubjectsQuery): Promise<RecommendationHit[]> {
    const subjects = [...new Set(query.subjects.map((s) => s.trim().toLowerCase()))].filter(
      Boolean,
    );
    if (subjects.length === 0) return [];

    // Ranked by how many of the reader's subjects a work shares, so a book matching three of
    // their genres outranks one that merely shares "Fiction" with everything else in the table.
    //
    // The subject list is built into an explicit ARRAY[...] literal rather than passed as one
    // parameter: postgres.js sends a JS array untyped, and Postgres rejects that outright with
    // "op ANY/ALL (array) requires array on right side" — found live.
    const rows = await this.db.execute<Record<string, unknown> & RecommendRow>(sql`
      SELECT w.id, w.original_title, w.author, w.first_published_year, w.cover_url,
             array_agg(DISTINCT lower(s.value)) AS matched
      FROM work w, jsonb_array_elements_text(w.subjects) AS s(value)
      WHERE lower(s.value) = ANY(ARRAY[${sql.join(
        subjects.map((subject) => sql`${subject}`),
        sql`, `,
      )}]::text[])
      GROUP BY w.id
      ORDER BY count(DISTINCT lower(s.value)) DESC, w.first_published_year DESC NULLS LAST
      LIMIT ${query.limit}
    `);

    return rows.map((row) => ({
      id: row.id,
      originalTitle: row.original_title,
      author: row.author,
      firstPublishedYear: row.first_published_year,
      coverUrl: row.cover_url,
      matchedSubjects: row.matched,
    }));
  }

  async popularSubjects(limit: number): Promise<{ subject: string; workCount: number }[]> {
    // Grouped on the lowercased heading so "Fiction" and "fiction" are one shelf, but the label
    // shown is a real spelling from the data rather than a lowercased one nobody wrote.
    const rows = await this.db.execute<
      Record<string, unknown> & { subject: string; work_count: string }
    >(sql`
      SELECT (array_agg(s.value ORDER BY s.value))[1] AS subject, count(*) AS work_count
      FROM work w, jsonb_array_elements_text(w.subjects) AS s(value)
      GROUP BY lower(s.value)
      ORDER BY count(*) DESC, lower(s.value) ASC
      LIMIT ${limit}
    `);

    return rows.map((row) => ({ subject: row.subject, workCount: Number(row.work_count) }));
  }
}
