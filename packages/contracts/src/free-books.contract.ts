import { z } from 'zod';

/**
 * `GET /api/free-books?language=&limit=&offset=` — the free shelf.
 *
 * Every book here has at least one legal free copy on this instance: public domain or openly
 * licensed, from the provider allowlist (docs/legal-policy.md). The endpoint carries no rights
 * status per book because there is only one possible answer; a work that did not qualify is
 * simply not in the list.
 */
export const FreeBookSchema = z.object({
  id: z.string(),
  originalTitle: z.string(),
  author: z.string(),
  firstPublishedYear: z.number().int().nullable(),
  coverUrl: z.string().url().nullable(),
  /** Formats the free copies come in (`epub`, `pdf`, …). Empty means the source states none. */
  formats: z.array(z.string()),
});

export const FreeBooksQuerySchema = z.object({
  /** Only books whose free copy is in this language. Empty string means "no filter", which is
   * what an untouched `<select>` submits. */
  language: z
    .string()
    .transform((value) => (value.trim() === '' ? undefined : value.trim().toLowerCase()))
    .optional(),
  limit: z.coerce.number().int().min(1).max(60).default(24),
  offset: z.coerce.number().int().min(0).default(0),
});

export const FreeBooksResponseSchema = z.object({
  books: z.array(FreeBookSchema),
  /** All free books matching the filter, not just this page — so the UI can say "24 of 137". */
  total: z.number().int().nonnegative(),
  language: z.string().nullable(),
  limit: z.number().int().positive(),
  offset: z.number().int().nonnegative(),
});

export type FreeBook = z.infer<typeof FreeBookSchema>;
export type FreeBooksQuery = z.infer<typeof FreeBooksQuerySchema>;
export type FreeBooksResponse = z.infer<typeof FreeBooksResponseSchema>;
