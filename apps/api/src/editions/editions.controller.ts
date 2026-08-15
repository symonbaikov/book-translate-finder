import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import {
  EditionLinksQuerySchema,
  EditionLinksResponseSchema,
  EditionPricesQuerySchema,
  EditionPricesResponseSchema,
  type EditionLinksResponse,
  type EditionPricesResponse,
} from '@golden/contracts';
import type { AggregateEditionPrices, GetEditionLinks } from '@golden/application';
import { parseOrThrow } from '../common/validation/parse-or-throw.js';
import { TOKENS } from '../common/tokens.js';

@Controller('editions')
export class EditionsController {
  constructor(
    @Inject(TOKENS.GET_EDITION_LINKS) private readonly getEditionLinks: GetEditionLinks,
    @Inject(TOKENS.AGGREGATE_EDITION_PRICES)
    private readonly aggregateEditionPrices: AggregateEditionPrices,
  ) {}

  @Get(':id/links')
  async links(@Param('id') id: string, @Query() query: unknown): Promise<EditionLinksResponse> {
    const { country } = parseOrThrow(EditionLinksQuerySchema, query);
    const result = await this.getEditionLinks.execute({
      editionId: id,
      // `exactOptionalPropertyTypes`: the key must be absent, not present-with-undefined.
      ...(country ? { country } : {}),
    });
    return EditionLinksResponseSchema.parse(result);
  }

  /**
   * Module C. Separate from `/links` because the two answer different questions and age very
   * differently: links are stable for hours, prices are cached for minutes (docs/architecture.md
   * §6). Merging them would force the slower, shorter-lived one to dictate the other's TTL.
   */
  @Get(':id/prices')
  async prices(@Param('id') id: string, @Query() query: unknown): Promise<EditionPricesResponse> {
    const { country } = parseOrThrow(EditionPricesQuerySchema, query);
    const result = await this.aggregateEditionPrices.execute({
      editionId: id,
      ...(country ? { country } : {}),
    });
    return EditionPricesResponseSchema.parse(result);
  }
}
