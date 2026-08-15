import { Controller, Get, HttpCode, HttpStatus, Inject, Query, Res } from '@nestjs/common';
import { SearchQuerySchema, SearchResponseSchema, type SearchResponse } from '@golden/contracts';
import type { SearchWorks } from '@golden/application';
import type { FastifyReply } from 'fastify';
import { parseOrThrow } from '../common/validation/parse-or-throw.js';
import { TOKENS } from '../common/tokens.js';

@Controller('search')
export class SearchController {
  constructor(@Inject(TOKENS.SEARCH_WORKS) private readonly searchWorks: SearchWorks) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async search(
    @Query() query: unknown,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<SearchResponse> {
    const { q, limit } = parseOrThrow(SearchQuerySchema, query);
    const result = await this.searchWorks.execute({ query: q, limit });

    // 202 for the lazy-backfill "we queued it, poll again" state (ADR-0003) — everything else is 200.
    if (result.status === 'pending') {
      reply.status(HttpStatus.ACCEPTED);
    }

    return SearchResponseSchema.parse(result);
  }
}
