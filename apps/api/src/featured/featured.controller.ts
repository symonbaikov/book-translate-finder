import { Controller, Get, Inject } from '@nestjs/common';
import { FeaturedResponseSchema, type FeaturedResponse } from '@btf/contracts';
import type { GetFeaturedBooks } from '@btf/application';
import { TOKENS } from '../common/tokens.js';

@Controller('featured')
export class FeaturedController {
  constructor(
    @Inject(TOKENS.GET_FEATURED_BOOKS) private readonly getFeaturedBooks: GetFeaturedBooks,
  ) {}

  @Get()
  async list(): Promise<FeaturedResponse> {
    return FeaturedResponseSchema.parse(await this.getFeaturedBooks.execute());
  }
}
