import { z } from 'zod';

/** `GET /api/works/:id` (docs/architecture.md §4): the card — what languages exist, how many editions. */
export const WorkCardResponseSchema = z.object({
  id: z.string(),
  originalTitle: z.string(),
  originalLanguage: z.string(),
  author: z.string(),
  firstPublishedYear: z.number().int().nullable(),
  translatedLanguages: z.array(z.string()),
  editionCount: z.number().int().nonnegative(),
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
});

export type EditionSummary = z.infer<typeof EditionSummarySchema>;

export const EditionsResponseSchema = z.object({
  workId: z.string(),
  editions: z.array(EditionSummarySchema),
});

export type EditionsResponse = z.infer<typeof EditionsResponseSchema>;
