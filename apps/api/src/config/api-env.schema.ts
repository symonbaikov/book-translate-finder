import { baseEnvSchema } from '@btf/infrastructure';
import { z } from 'zod';

export const apiEnvSchema = baseEnvSchema.extend({
  API_PORT: z.coerce.number().int().positive().default(3001),
  PUBLIC_URL: z.string().url(),
  ADMIN_TOKEN: z
    .string()
    .min(16, 'ADMIN_TOKEN must be at least 16 characters — guards POST /api/sync/:source'),
  // Optional: an instance without these keys still runs, just with the corresponding
  // provider unregistered (docs/architecture.md §9.2) — this is normal for self-hosting.
  GOOGLE_BOOKS_API_KEY: z.string().optional(),
  WORLDCAT_API_KEY: z.string().optional(),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;
