import { z } from 'zod';
import { AddonContentTypeSchema } from './manifest.js';
import { isWebUrl } from './url.js';

/**
 * What an addon may say about a book, and how it may offer one.
 *
 * Two absences are decisions, not omissions.
 *
 * **No `rightsStatus` anywhere below.** The instance's own links carry one because the instance
 * knows where they came from and is accountable for them (docs/legal-policy.md I-4). An addon's
 * link is not ours and its legal status is not ours to assert; a field we would have to guess at is
 * worse than no field, because a guess rendered as metadata reads as a fact. Zod strips unknown
 * keys, so an addon that sends one is simply not heard on the subject.
 *
 * **No HTML anywhere below.** Every string here is rendered as text. An addon that wants emphasis
 * can want it.
 */

const WebUrlSchema = z.string().refine(isWebUrl, 'must be an absolute http(s) URL');

/** The shape a poster wants to be drawn at, so a grid does not have to guess and then reflow. */
export const PosterShapeSchema = z.enum(['poster', 'square', 'landscape']);
export type PosterShape = z.infer<typeof PosterShapeSchema>;

/** Enough to draw a book in a grid. Everything optional but the identity and the name. */
export const BookMetaPreviewSchema = z.object({
  id: z.string().min(1).max(200),
  type: AddonContentTypeSchema,
  name: z.string().min(1).max(500),
  poster: WebUrlSchema.optional(),
  posterShape: PosterShapeSchema.optional(),
  authors: z.array(z.string().min(1).max(200)).max(50).optional(),
  /** Free text, as printed: "1979", "1979–1983". Not parsed, because editions lie about it. */
  releaseInfo: z.string().max(60).optional(),
  description: z.string().max(5000).optional(),
  /** BCP-47 or ISO 639; not validated, because addons index languages inconsistently. */
  language: z.string().max(35).optional(),
});
export type BookMetaPreview = z.infer<typeof BookMetaPreviewSchema>;

/** Everything the addon knows about one book. */
export const BookMetaSchema = BookMetaPreviewSchema.extend({
  background: WebUrlSchema.optional(),
  publisher: z.string().max(200).optional(),
  published: z.string().max(60).optional(),
  isbn: z.string().max(20).optional(),
  pageCount: z.number().int().positive().max(100_000).optional(),
  subjects: z.array(z.string().min(1).max(120)).max(100).optional(),
  /** Where this addon says more about the book — its own page for it, typically. */
  website: WebUrlSchema.optional(),
});
export type BookMeta = z.infer<typeof BookMetaSchema>;

/**
 * One way to get the book, as offered by an addon. The direct analogue of Stremio's `Stream`.
 *
 * The core does not classify it: there is no "download vs buy vs borrow" here, because that
 * judgement belongs to whoever knows what is at the other end, and that is the addon. What the
 * core owes the reader instead is attribution — every source is rendered under the name of the
 * addon that produced it (docs/adr/0009-blind-core-link-policy-scope.md).
 */
export const AddonSourceSchema = z.object({
  /** Short label — a provider, an edition, a format. Stremio's `name`; shown as the row's title. */
  name: z.string().min(1).max(120),
  /** The longer line under it. */
  title: z.string().max(500).optional(),
  url: WebUrlSchema,
  /** `epub`, `pdf`, `mp3`, or whatever the addon calls it. Free text, shown as a chip. */
  format: z.string().max(40).optional(),
  /** Bytes. Shown only if present; never estimated. */
  fileSize: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).optional(),
  language: z.string().max(35).optional(),
  description: z.string().max(2000).optional(),
  behaviorHints: z
    .object({
      /** Opening this needs an account or a purchase — the interface says so before the click. */
      requiresAccount: z.boolean().optional(),
      /** It is a page to visit, not a file to fetch. */
      externalPage: z.boolean().optional(),
    })
    .optional(),
});
export type AddonSource = z.infer<typeof AddonSourceSchema>;

/**
 * The response envelopes.
 *
 * A list is validated in two steps — the envelope strictly, then each entry on its own — because
 * the two failures deserve different answers. A body that is not an object with the expected key
 * means the addon is not speaking this protocol, and there is nothing to show. One malformed book
 * inside a page of forty is an ordinary addon bug, and dropping the other thirty-nine over it would
 * punish the reader for someone else's typo. So entries are collected individually and the count of
 * the unreadable ones travels with the result, where the interface can mention it instead of
 * quietly showing a short list.
 *
 * `meta` is the exception: there is exactly one, so partial success has no meaning.
 */
export const CatalogEnvelopeSchema = z.object({ metas: z.array(z.unknown()).max(1000) });
export const SourcesEnvelopeSchema = z.object({ sources: z.array(z.unknown()).max(500) });
export const MetaResponseSchema = z.object({ meta: BookMetaSchema });

export interface CatalogResponse {
  readonly metas: readonly BookMetaPreview[];
  readonly dropped: number;
}
export interface SourcesResponse {
  readonly sources: readonly AddonSource[];
  readonly dropped: number;
}
export type MetaResponse = z.infer<typeof MetaResponseSchema>;

/** Parses each entry on its own, keeping the good ones and counting the rest. */
export function collectValid<T>(
  schema: z.ZodType<T>,
  entries: readonly unknown[],
): { kept: T[]; dropped: number } {
  const kept: T[] = [];
  let dropped = 0;
  for (const entry of entries) {
    const result = schema.safeParse(entry);
    if (result.success) kept.push(result.data);
    else dropped += 1;
  }
  return { kept, dropped };
}
