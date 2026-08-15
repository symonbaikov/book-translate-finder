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
 *
 * v4: dropped the ISBN-derived cover fallback. The shape is unchanged, but the *values* are — a
 * cached editions list from v3 carries `covers.openlibrary.org/b/isbn/…` URLs that 404 a second
 * at a time, and would go on doing so for an hour after the deploy on every work anyone had
 * already opened. Bumping is the cheapest way for that to heal on the first request instead.
 */
export const CACHE_KEY_VERSION = 'v4';
