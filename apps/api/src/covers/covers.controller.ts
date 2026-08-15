import { Controller, Get, Inject, Query, Res } from '@nestjs/common';
import type { GetCoverImage } from '@golden/application';
import { z } from 'zod';
import type { FastifyReply } from 'fastify';
import { parseOrThrow } from '../common/validation/parse-or-throw.js';
import { TOKENS } from '../common/tokens.js';

const CoverQuerySchema = z.object({
  /** The cover's URL at its source. Only allowlisted hosts are ever fetched — see `coverSourceUrl`. */
  src: z.string().url().max(2048),
});

/**
 * `GET /api/covers?src=` — this instance relaying a cover image instead of sending the reader to
 * Open Library for it.
 *
 * Why it is worth an endpoint at all is in `GetCoverImage`: the source URL answers 302 to
 * archive.org, which answers 302 again, so a browser pays three hosts and about 2.6 seconds per
 * cover, and a grid of books arrives one cover every couple of seconds.
 *
 * A cover that cannot be served is a 404 rather than an error page, because the UI already draws
 * the right thing for a missing cover — its typographic placeholder — and an HTML error body
 * handed to an `<img>` tag would only be a broken icon.
 */
@Controller('covers')
export class CoversController {
  constructor(@Inject(TOKENS.GET_COVER_IMAGE) private readonly getCoverImage: GetCoverImage) {}

  @Get()
  async cover(@Query() query: unknown, @Res() reply: FastifyReply): Promise<void> {
    const { src } = parseOrThrow(CoverQuerySchema, query);
    const result = await this.getCoverImage.execute({ src });

    if (result.status === 'unavailable') {
      // Short, because "unavailable" is often a source having a bad minute rather than a book
      // having no cover, and a day-long negative cache would outlive the reason for it.
      await reply.status(404).header('Cache-Control', 'public, max-age=300').send();
      return;
    }

    await reply
      .status(200)
      .header('Content-Type', result.contentType)
      // A cover is addressed by a URL that names the exact image; when the book gets a different
      // cover it gets a different URL. So this one can be kept for as long as the browser likes.
      .header('Cache-Control', 'public, max-age=31536000, immutable')
      .header('Content-Length', String(result.bytes.byteLength))
      .send(Buffer.from(result.bytes));
  }
}
