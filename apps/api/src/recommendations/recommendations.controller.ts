import { Body, Controller, Inject, Post } from '@nestjs/common';
import {
  RecommendationsRequestSchema,
  RecommendationsResponseSchema,
  type RecommendationsResponse,
} from '@golden/contracts';
import type { RecommendBooks } from '@golden/application';
import { parseOrThrow } from '../common/validation/parse-or-throw.js';
import { TOKENS } from '../common/tokens.js';

@Controller('recommendations')
export class RecommendationsController {
  constructor(@Inject(TOKENS.RECOMMEND_BOOKS) private readonly recommend: RecommendBooks) {}

  /**
   * Takes genres, returns books. The request body is used to answer and then dropped — it is
   * never written to the database, attached to a session, or logged (docs/adr/0006).
   */
  @Post()
  async recommend_(@Body() body: unknown): Promise<RecommendationsResponse> {
    const input = parseOrThrow(RecommendationsRequestSchema, body);
    return RecommendationsResponseSchema.parse(await this.recommend.execute(input));
  }
}
