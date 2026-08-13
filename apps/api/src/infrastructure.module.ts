import { Global, Module, type DynamicModule } from '@nestjs/common';
import type { ApiContext } from './composition-root.js';
import { TOKENS } from './common/tokens.js';
import type { ApiEnv } from './config/api-env.schema.js';

/**
 * Makes the already-built use case instances (composition-root.ts) available to every feature
 * module via DI, without each of them needing to import this module explicitly (`@Global()`) —
 * apps/api's controllers stay Nest-idiomatic (constructor injection) while the actual wiring of
 * concrete adapters happens in exactly one place, same as apps/worker's composition-root.ts.
 */
@Global()
@Module({})
export class InfrastructureModule {
  static forRoot(ctx: ApiContext, env: ApiEnv): DynamicModule {
    return {
      module: InfrastructureModule,
      providers: [
        { provide: TOKENS.API_ENV, useValue: env },
        { provide: TOKENS.SEARCH_WORKS, useValue: ctx.searchWorks },
        { provide: TOKENS.GET_WORK_CARD, useValue: ctx.getWorkCard },
        { provide: TOKENS.LIST_EDITIONS_FOR_WORK, useValue: ctx.listEditionsForWork },
        { provide: TOKENS.GET_EDITION_LINKS, useValue: ctx.getEditionLinks },
        { provide: TOKENS.ENQUEUE_SOURCE_SYNC, useValue: ctx.enqueueSourceSync },
      ],
      exports: Object.values(TOKENS),
    };
  }
}
