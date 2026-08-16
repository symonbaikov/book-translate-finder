import { z } from 'zod';

/**
 * `GET /api/works/:id/ratings` — what readers thought of each edition of one work.
 *
 * **Read the field names literally.** This is a rating *of an edition*, by the readers of one
 * source, and nothing in this schema claims to measure how good a translation is — no open source
 * publishes that. What the response is built for is the comparison: several editions of the same
 * work in the same language, each with its own average and its own vote count, so a reader can see
 * which translator's printings people got on with. `votes` and `lowConfidence` are part of the
 * contract for that reason: an average without the crowd behind it is a decimal point pretending
 * to be evidence.
 *
 * `withoutIsbn` and `notLookedUp` are in the successful response for the same reason `degraded` is
 * in the prices one — a partial answer that names its gaps is honest; one that hides them reads as
 * complete.
 */

export const EditionRatingSchema = z.object({
  editionId: z.string(),
  /** Which source's readers voted — always shown next to the number. */
  providerId: z.string(),
  providerName: z.string(),
  /** Mean score on the `outOf` scale, rounded to one decimal. */
  average: z.number().nonnegative(),
  outOf: z.number().positive(),
  /** Always ≥ 1: an average nobody voted on is not published (see the `Rating` value object). */
  votes: z.number().int().positive(),
  /** Too few voters to compare this edition against another. Shown, never used to rank. */
  lowConfidence: z.boolean(),
  /** The source's page for this edition, where the reviews behind the number are. */
  url: z.string().url().nullable(),
});

export type EditionRating = z.infer<typeof EditionRatingSchema>;

/**
 * Where the reviews of one printing are — an address, not a score.
 *
 * Separate from `EditionRatingSchema` because the two are available on different terms: a number
 * needs an API key, an identifier does not. On an instance with no `GOOGLE_BOOKS_API_KEY` this is
 * the whole of what the endpoint can offer, and it must not be mistaken for a rating.
 */
export const EditionReviewLinkSchema = z.object({
  editionId: z.string(),
  providerId: z.string(),
  /** Reader-facing site name — the link always says where it leads. */
  providerName: z.string(),
  url: z.string().url(),
});

export type EditionReviewLink = z.infer<typeof EditionReviewLinkSchema>;

export const TranslatorRatingSchema = z.object({
  translator: z.string(),
  /** The language this translator rendered the book into — averages never cross languages. */
  language: z.string(),
  average: z.number().nonnegative(),
  outOf: z.number().positive(),
  /** Voters across every rated edition credited to this translator in this language. */
  votes: z.number().int().positive(),
  ratedEditions: z.number().int().positive(),
  lowConfidence: z.boolean(),
});

export type TranslatorRating = z.infer<typeof TranslatorRatingSchema>;

/** Matches `MAX_LOOKUPS_PER_WORK`: past this the use case stops looking anyway. */
const MAX_REQUESTED_EDITIONS = 24;

export const WorkRatingsQuerySchema = z.object({
  /** Same normalization as the editions endpoint: an empty string means "not specified". */
  language: z
    .string()
    .trim()
    .transform((value) => value || undefined)
    .pipe(z.string().length(2).optional())
    .optional(),
  /**
   * Which editions to rate, comma-separated, in the order the caller shows them.
   *
   * The caller has to say, because the server cannot know: `/works/:id/editions` returns rows
   * unordered and the client sorts them, so on a work with nine hundred printings the ten on
   * screen are not the first ten anywhere. Omitted, the API picks its own first few — fine for a
   * script, useless for a page.
   */
  editions: z
    .string()
    .trim()
    .transform((value) =>
      value
        ? value
            .split(',')
            .map((id) => id.trim())
            .filter(Boolean)
            .slice(0, MAX_REQUESTED_EDITIONS)
        : undefined,
    )
    .optional(),
});

export type WorkRatingsQuery = z.infer<typeof WorkRatingsQuerySchema>;

export const WorkRatingsResponseSchema = z.object({
  workId: z.string(),
  editions: z.array(EditionRatingSchema),
  /** Reviews of a specific printing. Independent of `editions`: an edition can have a link and
   *  no rating, which is the normal case without a Google Books key. */
  reviewLinks: z.array(EditionReviewLinkSchema),
  /** Only where one language has two or more rated translators — otherwise empty. */
  translators: z.array(TranslatorRatingSchema),
  /** Editions no source could be asked about, because they carry no ISBN. */
  withoutIsbn: z.number().int().nonnegative(),
  /** Editions past the per-request lookup cap, not covered by this answer. */
  notLookedUp: z.number().int().nonnegative(),
  /** Sources that failed this time, named rather than quietly missing. */
  degraded: z.array(z.object({ providerId: z.string(), reason: z.string() })),
  retrievedAt: z.string().datetime(),
});

export type WorkRatingsResponse = z.infer<typeof WorkRatingsResponseSchema>;
