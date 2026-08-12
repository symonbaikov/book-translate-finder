// Phase 1.0 skeleton: only the error hierarchy needed to wire apps/api's global error filter.
// Entities, value objects, ports and LinkPolicy land in Phase 1.1 (see docs/plan.md §1.1) —
// add their exports here as they're built, do not pre-declare empty stubs.
export {
  DomainError,
  InvalidInputError,
  NotFoundError,
  ConflictError,
} from './errors/domain-error.js';
