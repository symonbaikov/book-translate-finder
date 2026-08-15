import { z } from 'zod';

/**
 * `GET /api/editions/:id/prices` — Module C's response.
 *
 * Two things in this schema are load-bearing rather than incidental. `amountMinor` is nullable and
 * has no default: a shop with no published price says `null`, and there is deliberately no way to
 * express "free" by accident. And `degraded` is part of the successful response, so a shop that
 * timed out is *named* instead of quietly vanishing from a list the reader will read as complete.
 */

export const BookFormatSchema = z.enum(['hardcover', 'paperback', 'ebook', 'audiobook', 'unknown']);

export const PriceOfferSchema = z.object({
  providerId: z.string(),
  providerName: z.string(),
  format: BookFormatSchema,
  /** Minor units (cents). `null` means the shop publishes no price — never `0`. */
  amountMinor: z.number().int().nonnegative().nullable(),
  /** The same amount as the decimal the shop prints; `null` alongside `amountMinor`. */
  amount: z.number().nonnegative().nullable(),
  /** ISO 4217, uppercase. Prices are never converted between currencies. */
  currency: z.string().length(3).nullable(),
  url: z.string().url(),
  availability: z.enum(['available', 'unavailable', 'unknown']),
  note: z.string().nullable(),
});

export type PriceOfferDto = z.infer<typeof PriceOfferSchema>;

export const PriceGroupSchema = z.object({
  format: BookFormatSchema,
  offers: z.array(PriceOfferSchema),
});

export const EditionPricesQuerySchema = z.object({
  /** Same normalization as the links endpoint: an empty string means "not specified", not a 400. */
  country: z
    .string()
    .trim()
    .transform((value) => value || undefined)
    .pipe(z.string().length(2).optional())
    .optional(),
});

export type EditionPricesQuery = z.infer<typeof EditionPricesQuerySchema>;

export const EditionPricesResponseSchema = z.object({
  editionId: z.string(),
  groups: z.array(PriceGroupSchema),
  /** Providers that did not answer this time, so a partial list is never mistaken for a full one. */
  degraded: z.array(z.object({ providerId: z.string(), reason: z.string() })),
  retrievedAt: z.string().datetime(),
});

export type EditionPricesResponse = z.infer<typeof EditionPricesResponseSchema>;
