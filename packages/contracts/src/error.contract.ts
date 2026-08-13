import { z } from 'zod';

/**
 * Uniform error body across all `/api` routes — mirrors `apps/api`'s `DomainErrorFilter` /
 * `UnhandledErrorFilter` (docs/architecture.md §2.5), formalized here as promised by their
 * Phase 1.0 comment ("a full ProblemDetails contract lands in packages/contracts... Phase 1.4").
 */
export const ApiErrorResponseSchema = z.object({
  status: z.number().int(),
  code: z.string(),
  title: z.string(),
});

export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;
