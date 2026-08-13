/** DI tokens for the pre-built use case instances `InfrastructureModule` provides (composition-root.ts). */
export const TOKENS = {
  API_ENV: Symbol('API_ENV'),
  SEARCH_WORKS: Symbol('SEARCH_WORKS'),
  GET_WORK_CARD: Symbol('GET_WORK_CARD'),
  LIST_EDITIONS_FOR_WORK: Symbol('LIST_EDITIONS_FOR_WORK'),
  GET_EDITION_LINKS: Symbol('GET_EDITION_LINKS'),
  ENQUEUE_SOURCE_SYNC: Symbol('ENQUEUE_SOURCE_SYNC'),
} as const;
