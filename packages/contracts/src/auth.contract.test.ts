import { describe, expect, it } from 'vitest';
import { MIN_PASSWORD_LENGTH, RegisterRequestSchema, LoginRequestSchema } from './auth.contract.js';

describe('auth contracts', () => {
  it('rejects a password below the shared minimum', () => {
    const result = RegisterRequestSchema.safeParse({
      email: 'reader@example.com',
      password: 'a'.repeat(MIN_PASSWORD_LENGTH - 1),
    });
    expect(result.success).toBe(false);
  });

  it('accepts a registration without a display name — it is derived from the address', () => {
    const result = RegisterRequestSchema.safeParse({
      email: 'reader@example.com',
      password: 'a'.repeat(MIN_PASSWORD_LENGTH),
    });
    expect(result.success).toBe(true);
  });

  it('does not impose the minimum on login', () => {
    // An account created before the floor was raised must still be able to sign in and be told
    // "wrong password" honestly, rather than hitting a validation error it cannot act on.
    const result = LoginRequestSchema.safeParse({ email: 'reader@example.com', password: 'x' });
    expect(result.success).toBe(true);
  });
});
