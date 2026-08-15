import { z } from 'zod';

/** `GET /api/search?q=&limit=` (docs/architecture.md §4). */
export const SearchQuerySchema = z.object({
  q: z.string().trim().min(1).max(200),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;

export const SearchHitSchema = z.object({
  id: z.string(),
  originalTitle: z.string(),
  author: z.string(),
  firstPublishedYear: z.number().int().nullable(),
  coverUrl: z.string().url().nullable(),
  /** At least one edition has a free/public-domain download link — feeds the "free to
   * download" filter on the search results page. */
  hasFreeCopy: z.boolean(),
});

/**
 * Three response shapes, discriminated by `status` (ADR-0003 lazy backfill): `found` is a normal
 * hit list; `pending` means the query missed our own database, a backfill job was queued (or
 * already in flight), and the client should poll again after `pollAfterMs`; `not_found` is the
 * terminal state after a backfill attempt itself came up empty (backed by the 24h negative cache
 * so repeated identical queries don't keep re-triggering backfill jobs).
 */
export const SearchResponseSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('found'), results: z.array(SearchHitSchema) }),
  z.object({ status: z.literal('pending'), pollAfterMs: z.number().int().positive() }),
  z.object({ status: z.literal('not_found') }),
]);

export type SearchHit = z.infer<typeof SearchHitSchema>;
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
