import { HttpException, HttpStatus, type ArgumentsHost } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import type { Logger as PinoLogger } from 'pino';
import { describe, expect, it, vi } from 'vitest';
import { UnhandledErrorFilter } from './unhandled-error.filter.js';

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
  return { warn: vi.fn(), error: vi.fn() } as unknown as PinoLogger;
}

describe('UnhandledErrorFilter', () => {
  it("relays Nest's own HttpException with its real status (e.g. an unmatched route's 404)", () => {
    const reply = makeReply();
    const filter = new UnhandledErrorFilter(makeLogger());
    const exception = new HttpException('Cannot GET /nope', HttpStatus.NOT_FOUND);

    filter.catch(exception, makeHost(reply));

    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({
      status: 404,
      code: 'http_error',
      title: 'Cannot GET /nope',
    });
  });

  it('relays a Fastify-plugin error carrying statusCode (e.g. @fastify/rate-limit 429)', () => {
    const reply = makeReply();
    const filter = new UnhandledErrorFilter(makeLogger());
    const exception = Object.assign(new Error('Rate limit exceeded, retry in 1 minute'), {
      statusCode: 429,
    });

    filter.catch(exception, makeHost(reply));

    expect(reply.status).toHaveBeenCalledWith(429);
    expect(reply.send).toHaveBeenCalledWith({
      status: 429,
      code: 'http_error',
      title: 'Rate limit exceeded, retry in 1 minute',
    });
  });

  it('falls back to an opaque 500 for a genuinely unexpected error (docs/rules.md §3)', () => {
    const reply = makeReply();
    const filter = new UnhandledErrorFilter(makeLogger());

    filter.catch(new Error('database connection reset'), makeHost(reply));

    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({
      status: 500,
      code: 'internal_error',
      title: 'Internal server error',
    });
  });

  it('never leaks the original error message on the generic 500 path', () => {
    const reply = makeReply();
    const filter = new UnhandledErrorFilter(makeLogger());

    filter.catch(new Error('SELECT * FROM secrets failed: password=hunter2'), makeHost(reply));

    const [sentBody] = vi.mocked(reply.send).mock.calls[0] as [{ title: string }];
    expect(sentBody.title).not.toContain('hunter2');
  });
});
