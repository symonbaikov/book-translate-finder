import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import {
  EditionLinksQuerySchema,
  EditionLinksResponseSchema,
  type EditionLinksResponse,
} from '@btf/contracts';
import type { GetEditionLinks } from '@btf/application';
import { parseOrThrow } from '../common/validation/parse-or-throw.js';
import { TOKENS } from '../common/tokens.js';

@Controller('editions')
export class EditionsController {
  constructor(
    @Inject(TOKENS.GET_EDITION_LINKS) private readonly getEditionLinks: GetEditionLinks,
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
}
