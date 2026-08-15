import { z } from 'zod';

/**
 * `GET /api/opds/feeds` and `GET /api/opds/feeds/:id` — the relay for the catalogs shipped with
 * the app (Project Gutenberg, Standard Ebooks), which send no CORS headers and so cannot be read
 * by a browser.
 *
 * A reader's own catalog never appears here. Those are fetched by the browser, and their URLs stay
 * on the reader's device (docs/adr/0007) — which is why this endpoint takes a **feed id** and an
 * optional same-origin `href`, and has no way to accept an arbitrary URL.
 */

export const OpdsAcquisitionSchema = z.object({
  kind: z.enum(['open-access', 'buy', 'borrow', 'subscribe', 'sample', 'unspecified']),
  href: z.string().url(),
  mediaType: z.string().nullable(),
  format: z.string().nullable(),
  formatLabel: z.string(),
  title: z.string().nullable(),
  price: z.object({ amount: z.number(), currency: z.string().length(3) }).nullable(),
  sizeBytes: z.number().int().nonnegative().nullable(),
  /** The link yields a DRM licence, not the book — the UI must say so (docs/legal-policy.md I-4). */
  requiresDrmApp: z.boolean(),
  isAudio: z.boolean(),
  indirectMediaTypes: z.array(z.string()),
});

export const OpdsEntrySchema = z.object({
  id: z.string(),
  title: z.string(),
  authors: z.array(z.string()),
  summary: z.string().nullable(),
  language: z.string().nullable(),
  publisher: z.string().nullable(),
  published: z.string().nullable(),
  updated: z.string().nullable(),
  identifiers: z.array(z.string()),
  isbn13: z.string().nullable(),
  categories: z.array(z.string()),
  coverUrl: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
  acquisitions: z.array(OpdsAcquisitionSchema),
  /** Set when the entry is a sub-catalog rather than a book. */
  navigationHref: z.string().nullable(),
});

export const OpdsFeedSchema = z.object({
  version: z.enum(['1.2', '2.0']),
  id: z.string().nullable(),
  title: z.string(),
  updated: z.string().nullable(),
  feedUrl: z.string(),
  entries: z.array(OpdsEntrySchema),
  navigation: z.array(
    z.object({
      rel: z.string(),
      href: z.string(),
      title: z.string().nullable(),
      mediaType: z.string().nullable(),
    }),
  ),
  pagination: z.object({
    next: z.string().nullable(),
    previous: z.string().nullable(),
    first: z.string().nullable(),
    last: z.string().nullable(),
  }),
  searchDescriptionUrl: z.string().nullable(),
});

export type OpdsFeedDto = z.infer<typeof OpdsFeedSchema>;
export type OpdsEntryDto = z.infer<typeof OpdsEntrySchema>;
export type OpdsAcquisitionDto = z.infer<typeof OpdsAcquisitionSchema>;

export const OpdsFeedSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  /** Where the plugin may run — `server` here means "we relay it because CORS forbids the browser". */
  runtime: z.enum(['client', 'server', 'both']),
  accessMode: z.enum(['official-api', 'url-template', 'user-hosted']),
  homepage: z.string().optional(),
});

export const OpdsFeedListResponseSchema = z.object({
  feeds: z.array(OpdsFeedSummarySchema),
});

export type OpdsFeedListResponse = z.infer<typeof OpdsFeedListResponseSchema>;

export const OpdsFeedQuerySchema = z.object({
  /**
   * A URL taken from a previously returned feed — pagination or a sub-catalog. Must be on the
   * registered feed's own origin; the server rejects anything else, which is what keeps this
   * endpoint from being an open proxy.
   */
  href: z
    .string()
    .trim()
    .transform((value) => value || undefined)
    .optional(),
});

export type OpdsFeedQuery = z.infer<typeof OpdsFeedQuerySchema>;
