import { Controller, Delete, Get, Inject, Param, Post, Req } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import {
  BookmarkStateResponseSchema,
  BookmarksResponseSchema,
  type BookmarkStateResponse,
  type BookmarksResponse,
} from '@btf/contracts';
import type { AuthService, BookmarkService } from '@btf/application';
import { UnauthorizedError, type WorkRepository } from '@btf/domain';
import { TOKENS } from '../common/tokens.js';
import { readSessionToken } from './cookies.js';

@Controller('bookmarks')
export class BookmarksController {
  constructor(
    @Inject(TOKENS.AUTH_SERVICE) private readonly auth: AuthService,
    @Inject(TOKENS.BOOKMARK_SERVICE) private readonly bookmarks: BookmarkService,
    @Inject(TOKENS.WORK_REPOSITORY) private readonly workRepository: WorkRepository,
  ) {}

  @Get()
  async list(@Req() request: FastifyRequest): Promise<BookmarksResponse> {
    const userId = await this.requireUserId(request);
    const saved = await this.bookmarks.list(userId);

    // Resolved here rather than joined in the repository: the reading list is capped at 200, and
    // keeping the bookmark repository ignorant of `work` keeps the two aggregates independent.
    const items = await Promise.all(
      saved.map(async (bookmark) => {
        const work = await this.workRepository.findById(bookmark.workId);
        if (!work) return null;
        return {
          workId: work.id,
          originalTitle: work.originalTitle,
          author: work.author,
          coverUrl: work.coverUrl,
          firstPublishedYear: work.firstPublishedYear,
          savedAt: bookmark.createdAt.toISOString(),
        };
      }),
    );

    return BookmarksResponseSchema.parse({ bookmarks: items.filter((item) => item !== null) });
  }

  @Post(':workId')
  async add(
    @Req() request: FastifyRequest,
    @Param('workId') workId: string,
  ): Promise<BookmarkStateResponse> {
    const userId = await this.requireUserId(request);
    await this.bookmarks.add(userId, workId);
    return BookmarkStateResponseSchema.parse({ workId, saved: true });
  }

  @Delete(':workId')
  async remove(
    @Req() request: FastifyRequest,
    @Param('workId') workId: string,
  ): Promise<BookmarkStateResponse> {
    const userId = await this.requireUserId(request);
    await this.bookmarks.remove(userId, workId);
    return BookmarkStateResponseSchema.parse({ workId, saved: false });
  }

  private async requireUserId(request: FastifyRequest): Promise<string> {
    const user = await this.auth.authenticate(readSessionToken(request));
    if (!user) throw new UnauthorizedError('Sign in to use bookmarks');
    return user.id;
  }
}
