// Phase 1.1: entities, value objects, normalization, LinkPolicy, source-priority policy, and
// ports are all here. Use cases (SearchWorks, SyncWorkFromSource, ...) land in packages/application
// starting Phase 1.2-1.4 (docs/plan.md) as real repository/queue adapters become available to
// wire them against.

export {
  ConflictError,
  DomainError,
  InvalidInputError,
  NotFoundError,
  UnauthorizedError,
} from './errors/domain-error.js';

export { Edition, type CreateEditionParams } from './entities/edition.js';
export { SourceLink, type SourceLinkParams } from './entities/source-link.js';
export { Work, type CreateWorkParams } from './entities/work.js';

export {
  canonicalizeUrl,
  computeEditionNaturalKey,
  computeUrlHash,
  computeWorkNaturalKey,
  sha256Hex,
  type EditionNaturalKeyInput,
} from './normalization/natural-key.js';
export { normalizeText } from './normalization/normalize-text.js';

export {
  assertLinkAllowed,
  ForbiddenSourceError,
  IllegalDownloadLinkError,
  type LinkCandidate,
} from './policy/link-policy.js';
export {
  resolveFieldConflict,
  type FieldCandidate,
  type FieldCategory,
} from './policy/source-priority.js';

export { coverUrlFromIsbn } from './policy/cover-url.js';
export {
  AUTHORIZED_FREE_BOOKS,
  findAuthorizedFreeBooks,
  type AuthorizedFreeBook,
  type AuthorizedFreeDownload,
} from './policy/authorized-free-catalog.js';

export {
  BOOKSTORES,
  WORLDWIDE,
  bookstoresForCountry,
  supportedBookstoreCountries,
  type Bookstore,
  type CountryCode,
  bookstoresFor,
  bookstoresForGrouped,
  countriesForMarketLanguage,
  type BookstoreGroup,
  type GroupedBookstore,
  type BookstoreQuery,
} from './policy/bookstore-catalog.js';

export {
  type BookMetadataProvider,
  type ProviderEdition,
  type ProviderWork,
  type ProviderWorkDetails,
  type SearchQuery,
} from './ports/book-metadata-provider.port.js';
export { type CachePort } from './ports/cache.port.js';
export { type Clock } from './ports/clock.port.js';
export { type EditionRepository } from './ports/edition-repository.port.js';
export {
  type ExternalRefEntityType,
  type ExternalRefRepository,
} from './ports/external-ref-repository.port.js';
export { type IdGenerator } from './ports/id-generator.port.js';
export { type IdempotencyRecord, type IdempotencyStore } from './ports/idempotency-store.port.js';
export { type JobQueuePort } from './ports/job-queue.port.js';
export { type SourceLinkRepository } from './ports/source-link-repository.port.js';
export { type SyncLogEntry, type SyncLogRepository } from './ports/sync-log-repository.port.js';
export { type UnitOfWork } from './ports/unit-of-work.port.js';
export { type WorkRepository } from './ports/work-repository.port.js';
export {
  type RecommendationHit,
  type RecommendBySubjectsQuery,
  type SubjectBrowsePort,
  type SubjectBrowseQuery,
  type WorkSearchHit,
  type WorkSearchPort,
} from './ports/work-search.port.js';

export { ExternalRef } from './value-objects/external-ref.js';
export { Isbn } from './value-objects/isbn.js';
export { LanguageCode } from './value-objects/language-code.js';
export { LANGUAGE_NAMES, type LanguageNames } from './value-objects/language-names.js';
export { isLinkType, LINK_TYPES, type LinkType } from './value-objects/link-type.js';
export { ProviderId } from './value-objects/provider-id.js';
export {
  isRightsStatus,
  RIGHTS_STATUSES,
  type RightsStatus,
} from './value-objects/rights-status.js';

export { EmailAddress } from './value-objects/email-address.js';
export { User, type CreateUserParams } from './entities/user.js';
export { Session, type CreateSessionParams } from './entities/session.js';
export { Bookmark, type CreateBookmarkParams } from './entities/bookmark.js';
export type {
  BookmarkRepository,
  EmailSender,
  PasswordHasher,
  SessionRepository,
  TokenGenerator,
  UserRepository,
  VerifiedGoogleProfile,
  WelcomeEmail,
} from './ports/auth.port.js';
export {
  FEATURED_BOOKS,
  featuredBooksIn,
  type FeaturedBook,
  type FeaturedList,
} from './policy/featured-books-catalog.js';
