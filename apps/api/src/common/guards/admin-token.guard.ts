import { Inject, Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { UnauthorizedError } from '@golden/domain';
import type { FastifyRequest } from 'fastify';
import { TOKENS } from '../tokens.js';
import type { ApiEnv } from '../../config/api-env.schema.js';

/** Guards `POST /api/sync/:source` (docs/architecture.md §4) — Phase 1 stopgap, full auth is Phase 2. */
@Injectable()
export class AdminTokenGuard implements CanActivate {
  constructor(@Inject(TOKENS.API_ENV) private readonly env: ApiEnv) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const token = request.headers['x-admin-token'];

    if (token !== this.env.ADMIN_TOKEN) {
      throw new UnauthorizedError('Missing or invalid X-Admin-Token');
    }
    return true;
  }
}
