import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import {
  EditionsQuerySchema,
  EditionsResponseSchema,
  WorkCardResponseSchema,
  type EditionsResponse,
  type WorkCardResponse,
} from '@btf/contracts';
import type { GetWorkCard, ListEditionsForWork } from '@btf/application';
import { parseOrThrow } from '../common/validation/parse-or-throw.js';
import { TOKENS } from '../common/tokens.js';

@Controller('works')
export class WorksController {
  constructor(
    @Inject(TOKENS.GET_WORK_CARD) private readonly getWorkCard: GetWorkCard,
    @Inject(TOKENS.LIST_EDITIONS_FOR_WORK)
    private readonly listEditionsForWork: ListEditionsForWork,
  ) {}

  @Get(':id')
  async getCard(@Param('id') id: string): Promise<WorkCardResponse> {
    const result = await this.getWorkCard.execute({ workId: id });
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
}
