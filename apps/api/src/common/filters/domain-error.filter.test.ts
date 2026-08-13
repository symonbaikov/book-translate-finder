import { ConflictError, InvalidInputError, NotFoundError, UnauthorizedError } from '@btf/domain';
import type { ArgumentsHost } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import type { Logger as PinoLogger } from 'pino';
import { describe, expect, it, vi } from 'vitest';
import { DomainErrorFilter } from './domain-error.filter.js';

function makeHost(reply: FastifyReply): ArgumentsHost {
  return {
    switchToHttp: () => ({ getResponse: () => reply }),
  } as unknown as ArgumentsHost;
}

function makeReply(): FastifyReply {
  const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() };
  return reply as unknown as FastifyReply;
}

function makeLogger(): PinoLogger {
  return { warn: vi.fn() } as unknown as PinoLogger;
}

describe('DomainErrorFilter', () => {
  it.each([
    [new InvalidInputError('bad'), 400],
    [new NotFoundError('missing'), 404],
    [new ConflictError('conflict'), 409],
    [new UnauthorizedError('nope'), 401],
  ])('maps %s to status %i', (error, expectedStatus) => {
    const reply = makeReply();
    const filter = new DomainErrorFilter(makeLogger());

    filter.catch(error, makeHost(reply));

    expect(reply.status).toHaveBeenCalledWith(expectedStatus);
    expect(reply.send).toHaveBeenCalledWith({
      status: expectedStatus,
      code: error.code,
      title: error.message,
    });
  });
});
