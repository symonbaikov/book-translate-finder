import { createLogger, loadEnv } from '@btf/infrastructure';
import { workerEnvSchema } from './config/worker-env.schema.js';

function main(): void {
  const env = loadEnv(workerEnvSchema);
  const logger = createLogger({
    service: '@btf/worker',
    level: env.LOG_LEVEL,
    pretty: env.NODE_ENV === 'development',
  });

  // Phase 1.0: the process boots, logs, and stays alive under a supervisor (Docker/pm2) so
  // `pnpm dev` has something real to run. BullMQ queues (sync, backfill) and their consumers
  // are registered here starting Phase 1.3 (docs/plan.md §1.3, docs/adr/0003-lazy-backfill.md) —
  // there is no queue infrastructure or use case to wire in yet.
  logger.info(
    { concurrency: env.WORKER_CONCURRENCY },
    'apps/worker started, no queues registered yet',
  );

  const shutdown = (signal: string): void => {
    logger.info({ signal }, 'apps/worker shutting down');
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main();
