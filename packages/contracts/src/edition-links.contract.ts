import { z } from 'zod';

/**
 * `GET /api/editions/:id/links` (docs/architecture.md §4) — every link carries its own explicit
 * `rightsStatus`, a product and legal-policy requirement simultaneously (docs/legal-policy.md):
 * the client must never have to infer legality from a link's mere presence.
 */
export const SourceLinkSchema = z.object({
  type: z.enum(['download', 'buy', 'borrow']),
  provider: z.string(),
  rightsStatus: z.enum(['public_domain', 'open_license', 'copyrighted', 'unknown']),
  url: z.string().url(),
});

export type SourceLinkDto = z.infer<typeof SourceLinkSchema>;

export const EditionLinksResponseSchema = z.object({
  editionId: z.string(),
  links: z.array(SourceLinkSchema),
});

export type EditionLinksResponse = z.infer<typeof EditionLinksResponseSchema>;
