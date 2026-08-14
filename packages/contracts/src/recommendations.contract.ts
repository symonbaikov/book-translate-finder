import { z } from 'zod';

/**
 * `POST /api/recommendations`.
 *
 * A POST with a body rather than a GET with query parameters, deliberately: the payload is a list
 * of the genres someone has been reading, and query strings end up in access logs, proxy logs and
 * `Referer` headers. A body does not. Nothing here is stored — see
 * docs/adr/0006-local-recommendations.md.
 */
export const RecommendationsRequestSchema = z.object({
  subjects: z.array(z.string().min(1).max(120)).max(20),
  excludeWorkIds: z.array(z.string().min(1).max(64)).max(100).default([]),
});

export type RecommendationsRequest = z.infer<typeof RecommendationsRequestSchema>;

export const RecommendationsResponseSchema = z.object({
  books: z.array(
    z.object({
      id: z.string(),
      originalTitle: z.string(),
      author: z.string(),
      firstPublishedYear: z.number().int().nullable(),
      coverUrl: z.string().url().nullable(),
      /** The genres this book shares with what the reader has been opening. */
      matchedSubjects: z.array(z.string()),
    }),
  ),
});

export type RecommendationsResponse = z.infer<typeof RecommendationsResponseSchema>;
