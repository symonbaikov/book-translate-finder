import type { LoggerService } from '@nestjs/common';
import type { Logger as PinoLogger } from 'pino';

/** Routes Nest's own framework logs through the shared pino logger (docs/architecture.md §7). */
export class NestPinoLogger implements LoggerService {
  constructor(private readonly logger: PinoLogger) {}

  log(message: unknown, ...optionalParams: unknown[]): void {
    this.logger.info({ context: optionalParams.at(-1) }, String(message));
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    this.logger.error({ context: optionalParams.at(-1) }, String(message));
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    this.logger.warn({ context: optionalParams.at(-1) }, String(message));
  }

  debug(message: unknown, ...optionalParams: unknown[]): void {
    this.logger.debug({ context: optionalParams.at(-1) }, String(message));
  }

  verbose(message: unknown, ...optionalParams: unknown[]): void {
    this.logger.trace({ context: optionalParams.at(-1) }, String(message));
  }
}
