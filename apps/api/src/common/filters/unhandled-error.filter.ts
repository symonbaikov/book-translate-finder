import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import type { Logger as PinoLogger } from 'pino';

interface FastifyStyleError {
  statusCode: number;
  message: string;
}

/** Fastify plugins (e.g. `@fastify/rate-limit`) throw plain `Error`s with a `statusCode`
 * property set by convention — not a Nest `HttpException`, so `instanceof` alone misses them. */
function isFastifyStyleError(exception: unknown): exception is FastifyStyleError {
  return (
    exception instanceof Error &&
    'statusCode' in exception &&
    typeof (exception as { statusCode: unknown }).statusCode === 'number'
  );
}

/**
 * Last-resort safety net for anything that isn't a `DomainError` — an opaque 500 that never
 * leaks internals to the client, full detail goes to the logs only (docs/rules.md §3).
 *
 * Two exception shapes are special-cased and relayed with their real status instead of being
 * flattened to 500, both found live:
 * - Nest's own `HttpException` (e.g. its built-in 404 for a route that matches nothing).
 * - Fastify plugin errors carrying a `statusCode` (e.g. `@fastify/rate-limit`'s 429) — these
 *   are plain `Error`s, not `HttpException`, so they need their own check.
 */
@Catch()
export class UnhandledErrorFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const reply = host.switchToHttp().getResponse<FastifyReply>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      this.logger.warn({ status, err: exception }, exception.message);
      void reply.status(status).send({ status, code: 'http_error', title: exception.message });
      return;
    }

    if (isFastifyStyleError(exception)) {
      const status = exception.statusCode;
      this.logger.warn({ status, err: exception }, exception.message);
      void reply.status(status).send({ status, code: 'http_error', title: exception.message });
      return;
    }

    this.logger.error({ err: exception }, 'Unhandled error');

    void reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'internal_error',
      title: 'Internal server error',
    });
  }
}
