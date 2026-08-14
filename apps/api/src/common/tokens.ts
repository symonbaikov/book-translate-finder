/** DI tokens for the pre-built use case instances `InfrastructureModule` provides (composition-root.ts). */
export const TOKENS = {
  API_ENV: Symbol('API_ENV'),
  SEARCH_WORKS: Symbol('SEARCH_WORKS'),
  GET_WORK_CARD: Symbol('GET_WORK_CARD'),
  LIST_EDITIONS_FOR_WORK: Symbol('LIST_EDITIONS_FOR_WORK'),
  GET_EDITION_LINKS: Symbol('GET_EDITION_LINKS'),
  ENQUEUE_SOURCE_SYNC: Symbol('ENQUEUE_SOURCE_SYNC'),
  AUTH_SERVICE: Symbol('AUTH_SERVICE'),
  BOOKMARK_SERVICE: Symbol('BOOKMARK_SERVICE'),
  WORK_REPOSITORY: Symbol('WORK_REPOSITORY'),
  AUTH_CONFIG: Symbol('AUTH_CONFIG'),
  /** Null on an instance without Google credentials — see AuthController. */
  GOOGLE_OAUTH: Symbol('GOOGLE_OAUTH'),
} as const;
