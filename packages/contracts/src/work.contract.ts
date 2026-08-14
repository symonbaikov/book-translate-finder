import { z } from 'zod';

/** `GET /api/works/:id` (docs/architecture.md §4): the card — what languages exist, how many editions. */
export const WorkCardResponseSchema = z.object({
  id: z.string(),
  originalTitle: z.string(),
  originalLanguage: z.string(),
  author: z.string(),
  firstPublishedYear: z.number().int().nullable(),
  description: z.string().nullable(),
  coverUrl: z.string().url().nullable(),
  /** Genre tags from the source. Free contributor text, capped by the domain — not a taxonomy. */
  subjects: z.array(z.string()).default([]),
  translatedLanguages: z.array(z.string()),
  editionCount: z.number().int().nonnegative(),
  sources: z.array(z.string()),
});

export type WorkCardResponse = z.infer<typeof WorkCardResponseSchema>;

/** `GET /api/works/:id/editions?language=&year=`. */
export const EditionsQuerySchema = z.object({
  language: z.string().length(2).optional(),
  year: z.coerce.number().int().optional(),
});

export type EditionsQuery = z.infer<typeof EditionsQuerySchema>;

export const EditionSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  language: z.string(),
  translator: z.string().nullable(),
  translatedFrom: z.string().nullable(),
  publisher: z.string().nullable(),
  year: z.number().int().nullable(),
  isbn: z.string().nullable(),
  coverUrl: z.string().url().nullable(),
  /** Printed page count, when the source states one. */
  pages: z.number().int().positive().nullable().default(null),
  /** Physical format as the source words it ("Paperback", "Hardcover"). */
  binding: z.string().nullable().default(null),
  /** Legal source links this edition has — lets the client surface availability on the list itself. */
  linkCount: z.number().int().nonnegative(),
  /** Whether bookstore lookups are offered for this edition. Always true now that a missing ISBN
   * falls back to a title search — kept in the response so a client need not encode that rule. */
  hasBookstores: z.boolean(),
});

export type EditionSummary = z.infer<typeof EditionSummarySchema>;

export const EditionsResponseSchema = z.object({
  workId: z.string(),
  editions: z.array(EditionSummarySchema),
});

export type EditionsResponse = z.infer<typeof EditionsResponseSchema>;
