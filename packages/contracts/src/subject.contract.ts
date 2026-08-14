import { z } from 'zod';

/** `GET /api/subjects` — tags that actually have works behind them. */
export const SubjectsResponseSchema = z.object({
  subjects: z.array(z.object({ subject: z.string(), workCount: z.number().int().nonnegative() })),
});

export type SubjectsResponse = z.infer<typeof SubjectsResponseSchema>;

/** `GET /api/subjects/:subject?language=` — the genre catalogue. */
export const SubjectBrowseQuerySchema = z.object({
  /** The reader's chosen book language. Empty string is treated as "no filter", because that is
   * what an untouched `<select>` submits. */
  language: z
    .string()
    .transform((value) => (value.trim() === '' ? undefined : value.trim().toLowerCase()))
    .optional(),
});

export const SubjectBrowseResponseSchema = z.object({
  subject: z.string(),
  language: z.string().nullable(),
  works: z.array(
    z.object({
      id: z.string(),
      originalTitle: z.string(),
      author: z.string(),
      firstPublishedYear: z.number().int().nullable(),
      coverUrl: z.string().url().nullable(),
    }),
  ),
});

export type SubjectBrowseResponse = z.infer<typeof SubjectBrowseResponseSchema>;
