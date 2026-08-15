import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  SyncParamsSchema,
  SyncRequestBodySchema,
  SyncResponseSchema,
  type SyncResponse,
} from '@golden/contracts';
import { InvalidInputError } from '@golden/domain';
import type { EnqueueSourceSync } from '@golden/application';
import { AdminTokenGuard } from '../common/guards/admin-token.guard.js';
import { parseOrThrow } from '../common/validation/parse-or-throw.js';
import { TOKENS } from '../common/tokens.js';

@Controller('sync')
export class SyncController {
  constructor(
    @Inject(TOKENS.ENQUEUE_SOURCE_SYNC) private readonly enqueueSourceSync: EnqueueSourceSync,
  ) {}

  @Post(':source')
  @UseGuards(AdminTokenGuard)
  @HttpCode(HttpStatus.OK)
  async sync(
    @Param('source') source: string,
    @Body() body: unknown,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
  ): Promise<SyncResponse> {
    if (!idempotencyKey) {
      throw new InvalidInputError('The Idempotency-Key header is required (docs/rules.md §2.4)');
    }

    const params = parseOrThrow(SyncParamsSchema, { source });
    const { query } = parseOrThrow(SyncRequestBodySchema, body);

    const result = await this.enqueueSourceSync.execute({
      source: params.source,
      query,
      idempotencyKey,
      endpoint: `POST /api/sync/${params.source}`,
    });

    return SyncResponseSchema.parse(result);
  }
}
