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
        { provide: TOKENS.GET_COVER_IMAGE, useValue: ctx.getCoverImage },
        { provide: TOKENS.GET_EDITION_LINKS, useValue: ctx.getEditionLinks },
        { provide: TOKENS.AGGREGATE_EDITION_PRICES, useValue: ctx.aggregateEditionPrices },
        {
          provide: TOKENS.AGGREGATE_TRANSLATION_RATINGS,
          useValue: ctx.aggregateTranslationRatings,
        },
        { provide: TOKENS.PUBLIC_OPDS_CATALOG, useValue: ctx.publicOpdsCatalog },
        { provide: TOKENS.FIND_NEARBY_STORES, useValue: ctx.findNearbyStores },
        { provide: TOKENS.ENQUEUE_SOURCE_SYNC, useValue: ctx.enqueueSourceSync },
        { provide: TOKENS.GET_FEATURED_BOOKS, useValue: ctx.getFeaturedBooks },
        { provide: TOKENS.LIST_FREE_BOOKS, useValue: ctx.listFreeBooks },
        { provide: TOKENS.LIST_SUBJECTS, useValue: ctx.listSubjects },
        { provide: TOKENS.BROWSE_BY_SUBJECT, useValue: ctx.browseBySubject },
        { provide: TOKENS.RECOMMEND_BOOKS, useValue: ctx.recommendBooks },
        { provide: TOKENS.AUTH_SERVICE, useValue: ctx.authService },
        { provide: TOKENS.BOOKMARK_SERVICE, useValue: ctx.bookmarkService },
        { provide: TOKENS.WORK_REPOSITORY, useValue: ctx.workRepository },
        { provide: TOKENS.AUTH_CONFIG, useValue: ctx.authConfig },
        { provide: TOKENS.GOOGLE_OAUTH, useValue: ctx.googleOAuth },
      ],
      exports: Object.values(TOKENS),
    };
  }
}
