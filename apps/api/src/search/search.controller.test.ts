import { InvalidInputError } from '@btf/domain';
import type { SearchWorks, SearchWorksOutput } from '@btf/application';
import type { FastifyReply } from 'fastify';
import { describe, expect, it, vi } from 'vitest';
import { SearchController } from './search.controller.js';

function makeSearchWorks(output: SearchWorksOutput): SearchWorks {
  return { execute: vi.fn(async () => output) } as unknown as SearchWorks;
}

function makeReply(): FastifyReply {
  const reply = { status: vi.fn().mockReturnThis() };
  return reply as unknown as FastifyReply;
}

describe('SearchController', () => {
  it('returns found results as-is', async () => {
    const searchWorks = makeSearchWorks({
      status: 'found',
      results: [
        {
          id: 'w1',
          originalTitle: 'War and Peace',
          author: 'Tolstoy',
          firstPublishedYear: 1869,
          coverUrl: null,
        },
      ],
    });
    const controller = new SearchController(searchWorks);
    const reply = makeReply();

    const result = await controller.search({ q: 'War and Peace' }, reply);

    expect(result.status).toBe('found');
    expect(reply.status).not.toHaveBeenCalled();
  });

  it('sets HTTP 202 for a pending response (ADR-0003)', async () => {
    const searchWorks = makeSearchWorks({ status: 'pending', pollAfterMs: 3000 });
    const controller = new SearchController(searchWorks);
    const reply = makeReply();

    await controller.search({ q: 'Some Untranslated Book' }, reply);

    expect(reply.status).toHaveBeenCalledWith(202);
  });

  it('rejects an empty query before calling the use case', async () => {
    const searchWorks = makeSearchWorks({ status: 'found', results: [] });
    const controller = new SearchController(searchWorks);
    const reply = makeReply();

    await expect(controller.search({ q: '' }, reply)).rejects.toThrow(InvalidInputError);
    expect(searchWorks.execute).not.toHaveBeenCalled();
  });

  it('passes q and limit through to the use case', async () => {
    const searchWorks = makeSearchWorks({ status: 'found', results: [] });
    const controller = new SearchController(searchWorks);

    await controller.search({ q: 'War and Peace', limit: '5' }, makeReply());

    expect(searchWorks.execute).toHaveBeenCalledWith({ query: 'War and Peace', limit: 5 });
  });
});
