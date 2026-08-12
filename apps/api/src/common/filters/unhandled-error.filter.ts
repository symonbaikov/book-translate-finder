import { type ArgumentsHost, Catch, type ExceptionFilter, HttpStatus } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import type { Logger as PinoLogger } from 'pino';

/**
 * Last-resort safety net for anything that isn't a `DomainError` — an opaque 500 that never
 * leaks internals to the client, full detail goes to the logs only (docs/rules.md §3).
 */
@Catch()
export class UnhandledErrorFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const reply = host.switchToHttp().getResponse<FastifyReply>();

    this.logger.error({ err: exception }, 'Unhandled error');

    void reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'internal_error',
      title: 'Internal server error',
    });
  }
}
