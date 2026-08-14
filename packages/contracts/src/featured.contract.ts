import { z } from 'zod';

/** `GET /api/featured` — the home page's curated lists, resolved against this instance's data. */
export const FeaturedBookSchema = z.object({
  workId: z.string(),
  title: z.string(),
  author: z.string(),
  year: z.number().int(),
  coverUrl: z.string().url().nullable(),
  list: z.enum(['books-of-the-year', 'popular']),
  /** At least one legal free copy exists — public domain download, open licence, or audiobook. */
  hasFreeCopy: z.boolean(),
});

export const FeaturedResponseSchema = z.object({
  books: z.array(FeaturedBookSchema),
  /** Some curated entries are still being fetched in the background (a fresh install). */
  filling: z.boolean(),
});

export type FeaturedResponse = z.infer<typeof FeaturedResponseSchema>;
export type FeaturedBook = z.infer<typeof FeaturedBookSchema>;
