import { pino, type Logger } from 'pino';

export interface CreateLoggerOptions {
  service: string;
  level: string;
  /** Pretty-print in development; structured JSON everywhere else (docs/architecture.md §7). */
  pretty?: boolean;
}

export function createLogger(options: CreateLoggerOptions): Logger {
  return pino({
    level: options.level,
    base: { service: options.service },
    // `exactOptionalPropertyTypes` forbids setting `transport` to `undefined` explicitly —
    // the key must be absent, not present-with-undefined, when pretty-printing is off.
    ...(options.pretty
      ? {
          transport: {
            target: 'pino-pretty',
            options: { colorize: true, translateTime: 'HH:MM:ss' },
          },
        }
      : {}),
  });
}

/**
 * Binds a `correlationId` so every log line emitted through the child logger carries it —
 * this is what lets a request be traced end to end into a queued job (docs/architecture.md §7).
 */
export function withCorrelationId(logger: Logger, correlationId: string): Logger {
  return logger.child({ correlationId });
}
