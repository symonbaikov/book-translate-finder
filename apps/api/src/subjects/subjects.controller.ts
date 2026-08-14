import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import {
  SubjectBrowseQuerySchema,
  SubjectBrowseResponseSchema,
  SubjectsResponseSchema,
  type SubjectBrowseResponse,
  type SubjectsResponse,
} from '@btf/contracts';
import type { BrowseBySubject, ListSubjects } from '@btf/application';
import { parseOrThrow } from '../common/validation/parse-or-throw.js';
import { TOKENS } from '../common/tokens.js';

@Controller('subjects')
export class SubjectsController {
  constructor(
    @Inject(TOKENS.LIST_SUBJECTS) private readonly listSubjects: ListSubjects,
    @Inject(TOKENS.BROWSE_BY_SUBJECT) private readonly browseBySubject: BrowseBySubject,
  ) {}

  @Get()
  async list(): Promise<SubjectsResponse> {
    return SubjectsResponseSchema.parse(await this.listSubjects.execute());
  }

  @Get(':subject')
  async browse(
    @Param('subject') subject: string,
    @Query() query: unknown,
  ): Promise<SubjectBrowseResponse> {
    const { language } = parseOrThrow(SubjectBrowseQuerySchema, query);
    const result = await this.browseBySubject.execute({
      subject: decodeURIComponent(subject),
      // `exactOptionalPropertyTypes`: absent, not present-with-undefined.
      ...(language ? { language } : {}),
    });
    return SubjectBrowseResponseSchema.parse(result);
  }
}
