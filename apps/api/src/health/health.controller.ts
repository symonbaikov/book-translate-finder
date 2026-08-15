import { Controller, Get } from '@nestjs/common';
import { HealthResponseSchema, type HealthResponse } from '@golden/contracts';

const SERVICE_NAME = '@golden/api';
const VERSION = '0.0.0';

@Controller('health')
export class HealthController {
  @Get('live')
  live(): HealthResponse {
    return HealthResponseSchema.parse({ status: 'ok', service: SERVICE_NAME, version: VERSION });
  }

  @Get('ready')
  ready(): HealthResponse {
    // Phase 1.0: no repository adapters exist yet, so there is nothing external to probe.
    // Phase 1.2 adds Postgres/Redis connectivity into `checks` without changing this contract
    // (docs/architecture.md §7).
    return HealthResponseSchema.parse({ status: 'ok', service: SERVICE_NAME, version: VERSION });
  }
}
