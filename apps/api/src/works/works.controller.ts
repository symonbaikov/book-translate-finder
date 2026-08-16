import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import {
  EditionsQuerySchema,
  EditionsResponseSchema,
  WorkCardQuerySchema,
  WorkCardResponseSchema,
  WorkRatingsQuerySchema,
  WorkRatingsResponseSchema,
  type EditionsResponse,
  type WorkCardResponse,
  type WorkRatingsResponse,
} from '@golden/contracts';
import type {
  AggregateTranslationRatings,
  GetWorkCard,
  ListEditionsForWork,
} from '@golden/application';
import { parseOrThrow } from '../common/validation/parse-or-throw.js';
import { TOKENS } from '../common/tokens.js';

@Controller('works')
export class WorksController {
  constructor(
    @Inject(TOKENS.GET_WORK_CARD) private readonly getWorkCard: GetWorkCard,
    @Inject(TOKENS.LIST_EDITIONS_FOR_WORK)
    private readonly listEditionsForWork: ListEditionsForWork,
    @Inject(TOKENS.AGGREGATE_TRANSLATION_RATINGS)
    private readonly aggregateTranslationRatings: AggregateTranslationRatings,
  ) {}

  @Get(':id')
  async getCard(@Param('id') id: string, @Query() query: unknown): Promise<WorkCardResponse> {
    const { language } = parseOrThrow(WorkCardQuerySchema, query);
    const result = await this.getWorkCard.execute({
      workId: id,
      ...(language !== undefined ? { language } : {}),
    });
    return WorkCardResponseSchema.parse(result);
  }

  @Get(':id/editions')
  async listEditions(@Param('id') id: string, @Query() query: unknown): Promise<EditionsResponse> {
    const { language, year } = parseOrThrow(EditionsQuerySchema, query);
    const result = await this.listEditionsForWork.execute({
      workId: id,
      ...(language !== undefined ? { language } : {}),
      ...(year !== undefined ? { year } : {}),
    });
    return EditionsResponseSchema.parse(result);
  }

  /**
   * Reader ratings for this work's editions, and per translator where a language has rivals.
   *
   * Per work rather than per edition, unlike `/editions/:id/prices`: the page needs a number under
   * every row at once, and one request per row is exactly what made `EditionPrices` collapse
   * behind a click after it tripped this API's own rate limit from a single reader. One request
   * per page, one outbound lookup per edition behind a day-long cache.
   */
  @Get(':id/ratings')
  async ratings(@Param('id') id: string, @Query() query: unknown): Promise<WorkRatingsResponse> {
    const { language, editions } = parseOrThrow(WorkRatingsQuerySchema, query);
    const result = await this.aggregateTranslationRatings.execute({
      workId: id,
      ...(language !== undefined ? { language } : {}),
      ...(editions !== undefined ? { editionIds: editions } : {}),
    });
    return WorkRatingsResponseSchema.parse(result);
  }
}
