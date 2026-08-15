import { Controller, Get, Inject, Query } from '@nestjs/common';
import {
  FeaturedQuerySchema,
  FeaturedResponseSchema,
  type FeaturedResponse,
} from '@golden/contracts';
import type { GetFeaturedBooks } from '@golden/application';
import { parseOrThrow } from '../common/validation/parse-or-throw.js';
import { TOKENS } from '../common/tokens.js';

@Controller('featured')
export class FeaturedController {
  constructor(
    @Inject(TOKENS.GET_FEATURED_BOOKS) private readonly getFeaturedBooks: GetFeaturedBooks,
  ) {}

  @Get()
  async list(@Query() query: unknown): Promise<FeaturedResponse> {
    const { language } = parseOrThrow(FeaturedQuerySchema, query);
    return FeaturedResponseSchema.parse(
      await this.getFeaturedBooks.execute({ ...(language !== undefined ? { language } : {}) }),
    );
  }
}
