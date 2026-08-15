import { Controller, Get, Inject, Query } from '@nestjs/common';
import { NotFoundError } from '@golden/domain';
import {
  NearbyStoresQuerySchema,
  NearbyStoresResponseSchema,
  type NearbyStoresResponse,
} from '@golden/contracts';
import type { FindNearbyStores } from '@golden/application';
import { parseOrThrow } from '../common/validation/parse-or-throw.js';
import { TOKENS } from '../common/tokens.js';

/**
 * Module B's **opt-in** server-side path, off unless `ENABLE_SERVER_GEO_LOOKUP=true`.
 *
 * The web app never calls it: it runs the same OpenStreetMap lookup in the browser precisely so a
 * reader's coordinates do not reach this instance (docs/adr/0007). This route exists for clients
 * that cannot — a CLI, a future mobile app, or a self-hoster who has registered a bookseller's
 * stock API that needs a secret key. Enabling it is a deliberate decision to accept locations into
 * your logs, so a disabled instance answers 404 rather than advertising a route it will not serve.
 */
@Controller('stores')
export class StoresController {
  constructor(
    @Inject(TOKENS.FIND_NEARBY_STORES) private readonly findNearbyStores: FindNearbyStores | null,
  ) {}

  @Get('nearby')
  async nearby(@Query() query: unknown): Promise<NearbyStoresResponse> {
    if (!this.findNearbyStores) {
      throw new NotFoundError(
        'Server-side store lookup is disabled on this instance (ENABLE_SERVER_GEO_LOOKUP)',
      );
    }

    const { isbn, lat, lng, radiusKm } = parseOrThrow(NearbyStoresQuerySchema, query);
    const result = await this.findNearbyStores.execute({
      editionIsbn: isbn ?? '',
      userLat: lat,
      userLng: lng,
      radiusKm,
    });
    return NearbyStoresResponseSchema.parse(result);
  }
}
