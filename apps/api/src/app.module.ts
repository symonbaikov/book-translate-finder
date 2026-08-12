import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module.js';

// Phase 1.0 skeleton: only health. Search/works/editions/sync modules land in Phase 1.4
// (docs/plan.md §1.4), each composing use cases from @btf/application with adapters from
// @btf/infrastructure — this module is the composition root (docs/architecture.md §2.5).
@Module({ imports: [HealthModule] })
export class AppModule {}
