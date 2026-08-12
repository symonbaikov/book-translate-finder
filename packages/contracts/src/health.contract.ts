import { z } from 'zod';

/**
 * Shared by apps/api's health controller and apps/web (or any external monitor) so both sides
 * agree on the response shape without either importing the other — see docs/architecture.md §7.
 */
export const HealthStatusSchema = z.enum(['ok', 'degraded', 'down']);

export const HealthResponseSchema = z.object({
  status: HealthStatusSchema,
  service: z.string(),
  version: z.string(),
  checks: z
    .record(z.string(), z.object({ status: HealthStatusSchema, message: z.string().optional() }))
    .optional(),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;
