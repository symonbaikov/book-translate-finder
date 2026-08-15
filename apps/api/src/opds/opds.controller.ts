import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import {
  OpdsFeedListResponseSchema,
  OpdsFeedQuerySchema,
  OpdsFeedSchema,
  type OpdsFeedDto,
  type OpdsFeedListResponse,
} from '@golden/contracts';
import type { PublicOpdsCatalog } from '@golden/infrastructure';
import { parseOrThrow } from '../common/validation/parse-or-throw.js';
import { TOKENS } from '../common/tokens.js';

/**
 * Module A's server half: the catalogs shipped with the app.
 *
 * It exists because Project Gutenberg and Standard Ebooks send no CORS headers — a browser cannot
 * read them, so without a relay the built-in shelves would be dead links. It is emphatically *not*
 * a URL proxy: the route takes a registered feed id, and the optional `href` must resolve onto
 * that feed's own origin. A catalog the reader added is never fetched here; those live on their
 * device and are read by the browser (docs/adr/0007).
 */
@Controller('opds')
export class OpdsController {
  constructor(@Inject(TOKENS.PUBLIC_OPDS_CATALOG) private readonly catalog: PublicOpdsCatalog) {}

  @Get('feeds')
  feeds(): OpdsFeedListResponse {
    return OpdsFeedListResponseSchema.parse({
      feeds: this.catalog.listFeeds().map((manifest) => ({
        id: manifest.id,
        name: manifest.name,
        runtime: manifest.runtime,
        accessMode: manifest.accessMode,
        ...(manifest.homepage ? { homepage: manifest.homepage } : {}),
      })),
    });
  }

  @Get('feeds/:id')
  async feed(@Param('id') id: string, @Query() query: unknown): Promise<OpdsFeedDto> {
    const { href } = parseOrThrow(OpdsFeedQuerySchema, query);
    const feed = await this.catalog.fetchFeed(id, href ?? null);
    return OpdsFeedSchema.parse(feed);
  }
}
