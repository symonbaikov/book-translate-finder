import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import type { IncomingMessage } from 'node:http';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { createLogger, loadEnv } from '@btf/infrastructure';
import { AppModule } from './app.module.js';
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

  const adapter = new FastifyAdapter({
    trustProxy: true,
    // Accept an upstream correlation id (from apps/web or a reverse proxy) so a request stays
    // traceable end to end into a queued job; generate one otherwise (docs/architecture.md §7).
    genReqId: (req: IncomingMessage) =>
      (req.headers['x-correlation-id'] as string | undefined) ?? randomUUID(),
  });

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter, {
    bufferLogs: true,
  });

  app.useLogger(new NestPinoLogger(logger));
  app.useGlobalFilters(new DomainErrorFilter(logger), new UnhandledErrorFilter(logger));
  app.enableCors({ origin: env.NODE_ENV === 'development' ? true : env.PUBLIC_URL });
  app.enableShutdownHooks();

  await app.listen(env.API_PORT, '0.0.0.0');
  logger.info({ port: env.API_PORT }, 'apps/api listening');
}

bootstrap().catch((error: unknown) => {
  // No logger available yet if env loading itself is what failed.
  console.error('apps/api failed to start:', error);
  process.exitCode = 1;
});
