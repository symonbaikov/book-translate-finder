import type { ExecutionContext } from '@nestjs/common';
import { UnauthorizedError } from '@golden/domain';
import { describe, expect, it } from 'vitest';
import type { ApiEnv } from '../../config/api-env.schema.js';
import { AdminTokenGuard } from './admin-token.guard.js';

function makeContext(headers: Record<string, string | undefined>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ headers }),
    }),
  } as unknown as ExecutionContext;
}

const ENV = { ADMIN_TOKEN: 'correct-token' } as ApiEnv;

describe('AdminTokenGuard', () => {
  it('allows a request with the correct X-Admin-Token', () => {
    const guard = new AdminTokenGuard(ENV);

    expect(guard.canActivate(makeContext({ 'x-admin-token': 'correct-token' }))).toBe(true);
  });

  it('throws UnauthorizedError for a wrong token', () => {
    const guard = new AdminTokenGuard(ENV);

    expect(() => guard.canActivate(makeContext({ 'x-admin-token': 'wrong' }))).toThrow(
      UnauthorizedError,
    );
  });

  it('throws UnauthorizedError for a missing token', () => {
    const guard = new AdminTokenGuard(ENV);

    expect(() => guard.canActivate(makeContext({}))).toThrow(UnauthorizedError);
  });
});
