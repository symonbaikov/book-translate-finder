import { Controller, Get, Inject, Query } from '@nestjs/common';
import {
  FreeBooksQuerySchema,
  FreeBooksResponseSchema,
  type FreeBooksResponse,
} from '@golden/contracts';
import type { ListFreeBooks } from '@golden/application';
import { parseOrThrow } from '../common/validation/parse-or-throw.js';
import { TOKENS } from '../common/tokens.js';

/** The free shelf (`GET /api/free-books`) — the home page's row and the catalogue behind it. */
@Controller('free-books')
export class FreeBooksController {
  constructor(@Inject(TOKENS.LIST_FREE_BOOKS) private readonly listFreeBooks: ListFreeBooks) {}

  @Get()
  async list(@Query() query: unknown): Promise<FreeBooksResponse> {
    const { language, limit, offset } = parseOrThrow(FreeBooksQuerySchema, query);
    return FreeBooksResponseSchema.parse(
      await this.listFreeBooks.execute({
        // `exactOptionalPropertyTypes`: absent, not present-with-undefined.
        ...(language ? { language } : {}),
        limit,
        offset,
      }),
    );
  }
}
