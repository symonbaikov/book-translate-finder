import { createLogger, loadEnv } from '@golden/infrastructure';
import { Queue, Worker, type Job } from 'bullmq';
import { buildWorkerContext, REGISTERED_SOURCES } from './composition-root.js';
import { workerEnvSchema } from './config/worker-env.schema.js';

const CRON_QUEUE_NAME = 'cron-refresh-stale-works';
const CRON_SCHEDULER_ID = 'refresh-stale-works';
/** Daily, well inside the "no less often than once a week" requirement (docs/architecture.md §5). */
const CRON_PATTERN = '0 3 * * *';

async function main(): Promise<void> {
  const env = loadEnv(workerEnvSchema);
  const logger = createLogger({
    service: '@golden/worker',
    level: env.LOG_LEVEL,
    pretty: env.NODE_ENV === 'development',
  });

  const ctx = buildWorkerContext(env);

  const syncWorker = new Worker(
    'sync',
    // `attachToWorkId` is optional and comes only from the nightly refresh's enrichment half —
    // `POST /api/sync/:source` and the discovery half both omit it, and a job without it keeps
    // deciding for itself which book it answered, exactly as before.
    async (job: Job<{ source: string; query: string; attachToWorkId?: string }>) => {
      const result = await ctx.syncWorkFromSource.execute(job.data);
      logger.info({ jobId: job.id, ...result }, 'sync job processed');
      return result;
    },
    { connection: ctx.bullConnection, concurrency: env.WORKER_CONCURRENCY },
  );

  // Lower concurrency than the regular sync worker (ADR-0003: backfill must not eat the rate
  // limit budget scheduled/manual syncs rely on) — fixed at 2, not WORKER_CONCURRENCY-scaled.
  const backfillWorker = new Worker(
    'backfill',
    async (job: Job<{ query: string }>) => {
      // `attemptsMade` counts the attempts *before* this one (0 on the first run), and BullMQ
      // retries while `attemptsMade + 1 < attempts` — so this is the run after which there is no
      // retry left. `ProcessBackfillJob` needs to know, because "throw and let the queue retry" is
      // only an answer while a retry exists; on the last one it has to answer the reader instead.
      const attempts = job.opts.attempts ?? 1;
      const result = await ctx.processBackfillJob.execute({
        ...job.data,
        lastAttempt: job.attemptsMade + 1 >= attempts,
      });
      logger.info({ jobId: job.id, ...result }, 'backfill job processed');
      return result;
    },
    { connection: ctx.bullConnection, concurrency: 2 },
  );

  const cronQueue = new Queue(CRON_QUEUE_NAME, { connection: ctx.bullConnection });
  await cronQueue.upsertJobScheduler(
    CRON_SCHEDULER_ID,
    { pattern: CRON_PATTERN },
    { name: 'refresh-stale-works' },
  );

  const cronWorker = new Worker(
    CRON_QUEUE_NAME,
    async () => {
      const result = await ctx.refreshStaleWorks.execute({
        olderThanDays: env.REFRESH_STALE_AFTER_DAYS,
        batchSize: env.REFRESH_BATCH_SIZE,
      });
      logger.info(result, 'RefreshStaleWorks cron run complete');
      return result;
    },
    { connection: ctx.bullConnection, concurrency: 1 },
  );

  for (const worker of [syncWorker, backfillWorker, cronWorker]) {
    worker.on('failed', (job: Job | undefined, error: Error) => {
      logger.error({ jobId: job?.id, queue: worker.name, err: error }, 'job failed');
    });
  }

  logger.info(
    { concurrency: env.WORKER_CONCURRENCY, sources: REGISTERED_SOURCES },
    'apps/worker started: sync, backfill, and cron-refresh-stale-works consumers running',
  );

  const shutdown = (signal: string): void => {
    logger.info({ signal }, 'apps/worker shutting down');
    void Promise.all([
      syncWorker.close(),
      backfillWorker.close(),
      cronWorker.close(),
      cronQueue.close(),
      ctx.close(),
    ]).finally(() => process.exit(0));
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((error: unknown) => {
  console.error('apps/worker failed to start:', error);
  process.exitCode = 1;
});
