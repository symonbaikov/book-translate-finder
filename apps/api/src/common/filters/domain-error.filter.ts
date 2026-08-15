import { type ArgumentsHost, Catch, type ExceptionFilter, HttpStatus } from '@nestjs/common';
import { DomainError } from '@golden/domain';
import type { FastifyReply } from 'fastify';
import type { Logger as PinoLogger } from 'pino';

const STATUS_BY_CODE: Record<string, number> = {
  invalid_input: HttpStatus.BAD_REQUEST,
  not_found: HttpStatus.NOT_FOUND,
  conflict: HttpStatus.CONFLICT,
  unauthorized: HttpStatus.UNAUTHORIZED,
};

/**
 * Translates domain errors into HTTP responses (docs/architecture.md §2.5) — this is the only
 * place in apps/api allowed to know that e.g. `NotFoundError` means 404. Every controller in
 * Phase 1.4 throws `DomainError` subtypes exclusively (never Nest's own `HttpException`) so this
 * filter — not `UnhandledErrorFilter`'s catch-all 500 — is always what handles a rejected request
 * (docs/contracts `ApiErrorResponseSchema`, `error.contract.ts`).
 */
@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {}

  catch(exception: DomainError, host: ArgumentsHost): void {
    const reply = host.switchToHttp().getResponse<FastifyReply>();
    const status = STATUS_BY_CODE[exception.code] ?? HttpStatus.INTERNAL_SERVER_ERROR;

    this.logger.warn({ code: exception.code, err: exception }, exception.message);

    void reply.status(status).send({
      status,
      code: exception.code,
      title: exception.message,
    });
  }
}
