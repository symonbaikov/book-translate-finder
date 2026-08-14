// Phase 1.3 adds the first real use case. `SearchWorks`, `GetWorkCard`, `EnqueueSourceSync`, etc.
// land with the API surface in Phase 1.4 — see docs/plan.md.
export type { UseCase } from './use-case.js';
export { CACHE_KEY_VERSION } from './cache-key-version.js';

export {
  SyncWorkFromSource,
  type SyncWorkFromSourceDeps,
  type SyncWorkFromSourceInput,
  type SyncWorkFromSourceOutput,
} from './use-cases/sync-work-from-source.use-case.js';

export {
  SearchWorks,
  backfillJobId,
  markSearchNotFound,
  searchNegativeCacheKey,
  searchResultsCacheKey,
  type SearchWorksDeps,
  type SearchWorksHit,
  type SearchWorksInput,
  type SearchWorksOutput,
} from './use-cases/search-works.use-case.js';

export {
  GetWorkCard,
  workCacheKey,
  type GetWorkCardDeps,
  type GetWorkCardInput,
  type GetWorkCardOutput,
} from './use-cases/get-work-card.use-case.js';

export {
  ListEditionsForWork,
  editionsCacheKey,
  type EditionSummaryDto,
  type ListEditionsForWorkDeps,
  type ListEditionsForWorkInput,
  type ListEditionsForWorkOutput,
} from './use-cases/list-editions-for-work.use-case.js';

export {
  GetEditionLinks,
  editionLinksCacheKey,
  type GetEditionLinksDeps,
  type GetEditionLinksInput,
  type GetEditionLinksOutput,
  type SourceLinkDto as EditionLinkDto,
} from './use-cases/get-edition-links.use-case.js';

export {
  EnqueueSourceSync,
  syncJobId,
  type EnqueueSourceSyncDeps,
  type EnqueueSourceSyncInput,
  type EnqueueSourceSyncOutput,
} from './use-cases/enqueue-source-sync.use-case.js';

export {
  RefreshStaleWorks,
  refreshJobId,
  type RefreshStaleWorksDeps,
  type RefreshStaleWorksInput,
  type RefreshStaleWorksOutput,
} from './use-cases/refresh-stale-works.use-case.js';

export {
  ProcessBackfillJob,
  type ProcessBackfillJobDeps,
  type ProcessBackfillJobInput,
  type ProcessBackfillJobOutput,
  type SourceSyncRunner,
} from './use-cases/process-backfill-job.use-case.js';
export {
  AuthService,
  BookmarkService,
  MIN_PASSWORD_LENGTH,
  SESSION_TTL_DAYS,
  type AuthDeps,
  type AuthenticatedUser,
  type BookmarkDeps,
  type BookmarkListItem,
  type SignInResult,
} from './use-cases/auth.use-cases.js';
export {
  featuredCacheKey,
  GetFeaturedBooks,
  type FeaturedBookDto,
  type GetFeaturedBooksDeps,
  type GetFeaturedBooksOutput,
} from './use-cases/get-featured-books.use-case.js';
export {
  BrowseBySubject,
  ListSubjects,
  subjectCacheKey,
  type BrowseBySubjectDeps,
  type BrowseBySubjectInput,
  type BrowseBySubjectOutput,
} from './use-cases/browse-by-subject.use-case.js';
