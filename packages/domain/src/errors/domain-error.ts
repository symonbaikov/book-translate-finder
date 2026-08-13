/**
 * Base class for every error raised from packages/domain or packages/application.
 *
 * apps/api's global error filter (docs/architecture.md §2.5) catches this type and maps it to
 * an HTTP response — domain code never knows about status codes. `code` is a stable machine
 * -readable identifier (used in logs and in the HTTP error body), independent of the human
 * `message`, which may change without becoming a breaking API change.
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = new.target.name;
  }
}

/** Thrown when input to a domain operation is structurally invalid. */
export class InvalidInputError extends DomainError {
  readonly code = 'invalid_input';
}

/** Thrown when a requested domain entity does not exist. */
export class NotFoundError extends DomainError {
  readonly code = 'not_found';
}

/** Thrown when an operation conflicts with existing state (e.g. idempotency key reuse with a different payload). */
export class ConflictError extends DomainError {
  readonly code = 'conflict';
}

/**
 * Thrown when a caller fails to authenticate for an operation that requires it (e.g. a missing
 * or wrong `X-Admin-Token` on `POST /api/sync/:source`, docs/architecture.md §4). Routed through
 * `DomainError` like every other error here so apps/api's catch-all `UnhandledErrorFilter`
 * (reserved for genuinely unexpected failures) never has to see it — see that filter's docstring.
 */
export class UnauthorizedError extends DomainError {
  readonly code = 'unauthorized';
}
