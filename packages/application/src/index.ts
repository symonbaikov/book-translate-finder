// Phase 1.3 adds the first real use case. `SearchWorks`, `GetWorkCard`, `EnqueueSourceSync`, etc.
// land with the API surface in Phase 1.4 — see docs/plan.md.
export type { UseCase } from './use-case.js';

export {
  SyncWorkFromSource,
  type SyncWorkFromSourceDeps,
  type SyncWorkFromSourceInput,
  type SyncWorkFromSourceOutput,
} from './use-cases/sync-work-from-source.use-case.js';
