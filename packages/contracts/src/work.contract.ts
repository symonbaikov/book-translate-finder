import { z } from 'zod';

/** `GET /api/works/:id` (docs/architecture.md §4): the card — what languages exist, how many editions. */
export const WorkCardResponseSchema = z.object({
  id: z.string(),
  originalTitle: z.string(),
  originalLanguage: z.string(),
  author: z.string(),
  firstPublishedYear: z.number().int().nullable(),
  description: z.string().nullable(),
  /**
   * The language `description` is in, when it is known. `null` means "as the source wrote it" —
   * Open Library never states a description's language, so claiming one would be a guess. Defaults
   * are present so a client pinned to an older API version still parses this response.
   */
  descriptionLanguage: z.string().nullable().default(null),
  /** Attribution for a localized description. Wikipedia's text is CC BY-SA, not public domain. */
  descriptionSource: z.object({ name: z.string(), url: z.string().url() }).nullable().default(null),
  coverUrl: z.string().url().nullable(),
  /** Genre tags from the source. Free contributor text, capped by the domain — not a taxonomy. */
  subjects: z.array(z.string()).default([]),
  translatedLanguages: z.array(z.string()),
  editionCount: z.number().int().nonnegative(),
  sources: z.array(z.string()),
});

export type WorkCardResponse = z.infer<typeof WorkCardResponseSchema>;

/**
 * `GET /api/works/:id?language=ru` — the reader's interface language, so the card can look for a
 * description in it. It never filters the card: a reader reading in Russian still sees every
 * edition and every translation the work has.
 */
export const WorkCardQuerySchema = z.object({
  language: z.string().length(2).optional(),
});

export type WorkCardQuery = z.infer<typeof WorkCardQuerySchema>;

/** `GET /api/works/:id/editions?language=&year=`. */
export const EditionsQuerySchema = z.object({
  language: z.string().length(2).optional(),
  year: z.coerce.number().int().optional(),
});

export type EditionsQuery = z.infer<typeof EditionsQuerySchema>;

/**
 * A free copy of one edition, carried on the edition list itself.
 *
 * `rightsStatus` is restricted to the two statuses that can make a copy free, and it is stated
 * rather than implied: no client should ever conclude "this must be legal, it is in the free
 * list" (docs/legal-policy.md).
 */
export const EditionFreeDownloadSchema = z.object({
  url: z.string().url(),
  /** `epub`, `txt`, `mp3`… `null` when the source states none — a reading page, not a file. */
  format: z.string().nullable(),
  provider: z.string(),
  type: z.enum(['download', 'listen']),
  rightsStatus: z.enum(['public_domain', 'open_license']),
});

export type EditionFreeDownload = z.infer<typeof EditionFreeDownloadSchema>;

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
  /** Copies of this edition the reader can take for nothing. Empty for almost every edition.
   * Defaulted so a response cached before this field existed still parses. */
  freeDownloads: z.array(EditionFreeDownloadSchema).default([]),
});

export type EditionSummary = z.infer<typeof EditionSummarySchema>;

export const EditionsResponseSchema = z.object({
  workId: z.string(),
  editions: z.array(EditionSummarySchema),
});

export type EditionsResponse = z.infer<typeof EditionsResponseSchema>;
