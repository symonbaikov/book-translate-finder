/**
 * Version prefix for every response-cache key (docs/architecture.md §6: "the v1 in the prefix
 * allows invalidating everything at once when the response format changes"). BUMP THIS whenever
 * a cached response's shape changes — found live in Phase 3: after `coverUrl` was added to the
 * editions response, cached pre-change entries survived the deploy, the use case returned them
 * verbatim, and the controller's own output validation correctly refused to serve them (500s
 * until the stale keys were flushed by hand). A version bump makes that self-healing: new code
 * simply never reads the old keys, and they expire by TTL.
 *
 * v2: added `coverUrl` to search hits and edition summaries, `description`/`coverUrl` to the
 * work card.
 */
export const CACHE_KEY_VERSION = 'v2';
