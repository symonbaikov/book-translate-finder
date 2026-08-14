import { Module, type DynamicModule } from '@nestjs/common';
import type { ApiContext } from './composition-root.js';
import type { ApiEnv } from './config/api-env.schema.js';
import { AuthModule } from './auth/auth.module.js';
import { FeaturedModule } from './featured/featured.module.js';
import { EditionsModule } from './editions/editions.module.js';
import { HealthModule } from './health/health.module.js';
import { InfrastructureModule } from './infrastructure.module.js';
import { SearchModule } from './search/search.module.js';
import { SyncModule } from './sync/sync.module.js';
import { WorksModule } from './works/works.module.js';

@Module({})
export class AppModule {
  static forRoot(ctx: ApiContext, env: ApiEnv): DynamicModule {
    return {
      module: AppModule,
      imports: [
        InfrastructureModule.forRoot(ctx, env),
        HealthModule,
        SearchModule,
        WorksModule,
        EditionsModule,
        SyncModule,
        AuthModule,
        FeaturedModule,
      ],
    };
  }
}
