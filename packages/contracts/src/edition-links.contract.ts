import { z } from 'zod';

/**
 * `GET /api/editions/:id/links` (docs/architecture.md §4) — every link carries its own explicit
 * `rightsStatus`, a product and legal-policy requirement simultaneously (docs/legal-policy.md):
 * the client must never have to infer legality from a link's mere presence.
 */
export const SourceLinkSchema = z.object({
  type: z.enum(['download', 'buy', 'borrow']),
  provider: z.string(),
  /** Human-readable store name — present on bookstore lookups, absent on source-discovered links. */
  providerName: z.string().optional(),
  /** Why a bookstore is offered: the reader's chosen country, this edition's language market, or
   * a shop that ships worldwide. Lets the UI label the reader's own choice as their choice. */
  group: z.enum(['country', 'language', 'worldwide']).optional(),
  rightsStatus: z.enum(['public_domain', 'open_license', 'copyrighted', 'unknown']),
  url: z.string().url(),
  /** File format for downloads (`epub`, `txt`, …) — tells the reader what they will get. */
  format: z.string().nullish(),
  /** Present when this link was found on a sibling edition of the same work, not the requested
   * edition itself — e.g. an old public-domain scan offered because the modern reprint has none.
   * `label` identifies which edition, so the reader knows what they'd actually be getting. */
  viaEdition: z.object({ id: z.string(), label: z.string() }).optional(),
});

export type SourceLinkDto = z.infer<typeof SourceLinkSchema>;

/**
 * `?country=` — ISO 3166-1 alpha-2, selects which bookstores to offer. An empty string is
 * normalized to "not specified" rather than rejected: that is exactly what a browser sends for a
 * cleared `<select>`, and treating it as a 400 would turn "Worldwide only" into an error page.
 */
export const EditionLinksQuerySchema = z.object({
  country: z
    .string()
    .trim()
    .transform((value) => value || undefined)
    .pipe(z.string().length(2).optional())
    .optional(),
});

export type EditionLinksQuery = z.infer<typeof EditionLinksQuerySchema>;

export const EditionLinksResponseSchema = z.object({
  editionId: z.string(),
  links: z.array(SourceLinkSchema),
  /**
   * ISBN lookups in bookstores serving the requested country. Deliberately separate from `links`:
   * these are derived from the ISBN, not discovered from a source, and they are *lookups* — the
   * shop is never fetched, so this is not a stock check (docs/legal-policy.md, bookstore-catalog.ts).
   */
  bookstores: z.array(SourceLinkSchema),
});

export type EditionLinksResponse = z.infer<typeof EditionLinksResponseSchema>;
