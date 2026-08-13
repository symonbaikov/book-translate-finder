import { z } from 'zod';

/**
 * `POST /api/sync/:source` (docs/architecture.md §4, docs/rules.md §2.4). Requires an
 * `Idempotency-Key` header (validated at the controller, not part of this body schema) and an
 * `X-Admin-Token` — Phase 1 stopgap authorization, full auth is Phase 2.
 */
export const SyncParamsSchema = z.object({
  source: z.string().min(1),
});

export type SyncParams = z.infer<typeof SyncParamsSchema>;

export const SyncRequestBodySchema = z.object({
  query: z.string().trim().min(1).max(200),
});

export type SyncRequestBody = z.infer<typeof SyncRequestBodySchema>;

/**
 * The endpoint only queues the job (docs/architecture.md §5 flow diagram:
 * `POST /api/sync/:source → EnqueueSourceSync → BullMQ → SyncWorkFromSource`) — it never runs
 * `SyncWorkFromSource` inline, so the response reports queuing, not sync results. `replayed:
 * true` means this exact `(Idempotency-Key, body)` pair was already processed — the stored
 * `jobId` is returned verbatim and nothing new was queued (docs/rules.md §2.4).
 */
export const SyncResponseSchema = z.object({
  status: z.literal('queued'),
  jobId: z.string(),
  replayed: z.boolean(),
});

export type SyncResponse = z.infer<typeof SyncResponseSchema>;
