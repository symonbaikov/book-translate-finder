import { z } from 'zod';

/** `GET /api/featured?language=ru` — the home page's lists, resolved against this instance's data. */
export const FeaturedBookSchema = z.object({
  workId: z.string(),
  title: z.string(),
  author: z.string(),
  /** Null in the `in-language` list, which is ordered by how often a book was published, not by year. */
  year: z.number().int().nullable(),
  coverUrl: z.string().url().nullable(),
  list: z.enum(['books-of-the-year', 'popular', 'in-language']),
  /** At least one legal free copy exists — public domain download, open licence, or audiobook. */
  hasFreeCopy: z.boolean(),
});

export const FeaturedResponseSchema = z.object({
  books: z.array(FeaturedBookSchema),
  /** Some entries are still being fetched in the background (a fresh install, or a new language). */
  filling: z.boolean(),
  /** The language the `in-language` list is in — null when this instance has no list for it. */
  language: z.string().nullable().default(null),
});

/** The reader's interface language, so the home page can lead with books written in it. */
export const FeaturedQuerySchema = z.object({
  language: z.string().length(2).optional(),
});

export type FeaturedResponse = z.infer<typeof FeaturedResponseSchema>;
export type FeaturedBook = z.infer<typeof FeaturedBookSchema>;
export type FeaturedQuery = z.infer<typeof FeaturedQuerySchema>;
