import { describe, expect, it } from 'vitest';
import { ApiErrorResponseSchema } from './error.contract.js';

describe('ApiErrorResponseSchema', () => {
  it('accepts the shape apps/api actually sends (DomainErrorFilter)', () => {
    const result = ApiErrorResponseSchema.safeParse({
      status: 404,
      code: 'not_found',
      title: 'Work not found',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a missing code', () => {
    const result = ApiErrorResponseSchema.safeParse({ status: 404, title: 'x' });
    expect(result.success).toBe(false);
  });
});
