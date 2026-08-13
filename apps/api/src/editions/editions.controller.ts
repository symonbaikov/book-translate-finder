import { Controller, Get, Inject, Param } from '@nestjs/common';
import { EditionLinksResponseSchema, type EditionLinksResponse } from '@btf/contracts';
import type { GetEditionLinks } from '@btf/application';
import { TOKENS } from '../common/tokens.js';

@Controller('editions')
export class EditionsController {
  constructor(
    @Inject(TOKENS.GET_EDITION_LINKS) private readonly getEditionLinks: GetEditionLinks,
  ) {}

  @Get(':id/links')
  async links(@Param('id') id: string): Promise<EditionLinksResponse> {
    const result = await this.getEditionLinks.execute({ editionId: id });
    return EditionLinksResponseSchema.parse(result);
  }
}
