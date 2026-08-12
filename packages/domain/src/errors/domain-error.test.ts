import { describe, expect, it } from 'vitest';
import { ConflictError, DomainError, InvalidInputError, NotFoundError } from './domain-error.js';

describe('DomainError hierarchy', () => {
  it.each([
    [InvalidInputError, 'invalid_input'],
    [NotFoundError, 'not_found'],
    [ConflictError, 'conflict'],
  ] as const)('%s carries a stable machine-readable code', (ErrorClass, expectedCode) => {
    const error = new ErrorClass('something went wrong');

    expect(error).toBeInstanceOf(DomainError);
    expect(error.code).toBe(expectedCode);
    expect(error.name).toBe(ErrorClass.name);
    expect(error.message).toBe('something went wrong');
  });

  it('preserves the original cause for debugging', () => {
    const cause = new Error('root cause');

    const error = new NotFoundError('work not found', { cause });

    expect(error.cause).toBe(cause);
  });
});
