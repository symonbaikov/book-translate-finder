import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import type { IncomingMessage } from 'node:http';
import fastifyRateLimit from '@fastify/rate-limit';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { createLogger, loadEnv } from '@btf/infrastructure';
import { AppModule } from './app.module.js';
import { buildApiContext } from './composition-root.js';
import { DomainErrorFilter } from './common/filters/domain-error.filter.js';
import { UnhandledErrorFilter } from './common/filters/unhandled-error.filter.js';
import { apiEnvSchema } from './config/api-env.schema.js';
import { NestPinoLogger } from './logging/nest-logger.adapter.js';

async function bootstrap(): Promise<void> {
  const env = loadEnv(apiEnvSchema);
  const logger = createLogger({
    service: '@btf/api',
    level: env.LOG_LEVEL,
    pretty: env.NODE_ENV === 'development',
  });

  const ctx = buildApiContext(env);

  const adapter = new FastifyAdapter({
    trustProxy: true,
    // Accept an upstream correlation id (from apps/web or a reverse proxy) so a request stays
    // traceable end to end into a queued job; generate one otherwise (docs/architecture.md §7).
    genReqId: (req: IncomingMessage) =>
      (req.headers['x-correlation-id'] as string | undefined) ?? randomUUID(),
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule.forRoot(ctx, env),
    adapter,
    {
      bufferLogs: true,
    },
  );

  app.useLogger(new NestPinoLogger(logger));
  // NestJS's `RouterExceptionFilters` reverses this array internally before matching
  // (`filters.reverse()`) so the *last*-registered filter is tried *first* — found live:
  // registering [DomainErrorFilter, UnhandledErrorFilter] made the catch-all
  // `UnhandledErrorFilter` (empty `@Catch()`) match every exception before `DomainErrorFilter`
  // ever got a chance, turning every `NotFoundError`/etc. into a generic 500. Order here is
  // therefore intentionally [catch-all, specific].
  app.useGlobalFilters(new UnhandledErrorFilter(logger), new DomainErrorFilter(logger));
  app.enableCors({ origin: env.NODE_ENV === 'development' ? true : env.PUBLIC_URL });

  // docs/architecture.md §4: search/works/editions/sync live under /api; health checks stay
  // unprefixed (§7), matching the usual container-orchestrator convention.
  app.setGlobalPrefix('api', { exclude: ['health/live', 'health/ready'] });

  // Basic per-IP rate limiting (docs/plan.md §1.4), Redis-backed so it's consistent across
  // multiple apps/api replicas rather than per-process in-memory counters.
  await app.register(fastifyRateLimit, {
    max: 60,
    timeWindow: '1 minute',
    redis: ctx.cacheRedis,
  });

  app.enableShutdownHooks();
  app
    .getHttpAdapter()
    .getInstance()
    .addHook('onClose', async () => {
      await ctx.close();
    });

  await app.listen(env.API_PORT, '0.0.0.0');
  logger.info({ port: env.API_PORT }, 'apps/api listening');
}

bootstrap().catch((error: unknown) => {
  // No logger available yet if env loading itself is what failed.
  console.error('apps/api failed to start:', error);
  process.exitCode = 1;
});
