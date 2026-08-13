import { baseEnvSchema } from '@btf/infrastructure';
import { z } from 'zod';

export const workerEnvSchema = baseEnvSchema.extend({
  WORKER_CONCURRENCY: z.coerce.number().int().positive().default(5),
  // Optional, same as apps/api's copy (docs/architecture.md §9.2) — works without a key, just
  // with lower rate limits (Phase 0 finding: anonymous quota exhausts almost immediately).
  GOOGLE_BOOKS_API_KEY: z.string().optional(),
  // Cron `RefreshStaleWorks` (docs/architecture.md §5): re-check a work at least this often,
  // capped at this many works per run so a large instance doesn't burst-enqueue thousands of
  // jobs and exhaust source rate limits in one go.
  REFRESH_STALE_AFTER_DAYS: z.coerce.number().int().positive().default(7),
  REFRESH_BATCH_SIZE: z.coerce.number().int().positive().default(50),
});

export type WorkerEnv = z.infer<typeof workerEnvSchema>;
