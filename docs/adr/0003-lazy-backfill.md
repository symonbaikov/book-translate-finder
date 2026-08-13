# ADR-0003: Lazy on-demand database population (lazy backfill)

- **Status:** accepted
- **Date:** 2026-08-12
- **Task context:** the requirement "a person can deploy the application themselves"

## Context

Self-hosting is declared the target scenario. A fresh installation starts with an empty
Postgres. Background sync only refreshes works the system already knows about, so an empty
database stays empty: the user enters their first query, gets zero results, and deletes the
container. At the same time an architectural rule applies: a user's HTTP request never calls an
external API synchronously (this protects against source rate limits and multi-second latency).

At first glance these two requirements contradict each other.

## Decision

A search miss against our own DB **enqueues a backfill job** and returns `202` with status
`pending` and a recommended polling delay. A worker asynchronously queries the providers,
performs upserts, and invalidates the cache; the client retries the request and gets `200`.

The rule is not violated: the controller still only reads the DB and puts a job on the queue;
it is the worker that goes outside.

Details:

- `jobId = backfill-{sha256(normalize(query))}-{YYYY-MM-DD}` — parallel and repeated identical
  requests from different users collapse into one job (idempotency, ADR-0002).
- A separate `backfill` queue with bounded concurrency and lower priority than scheduled sync —
  so the stream of misses doesn't eat up source rate limits.
- Abuse protection: rate limit on backfill enqueueing per IP, a global daily job ceiling per
  installation, filtering of junk queries (too short, digits only).
- A negative result is cached (`not_found`, TTL 24 h); otherwise the same nonexistent query
  would spawn jobs forever.
- Stale but existing data is served immediately (`200`), and a background refresh is enqueued in
  parallel — the user doesn't wait for the sake of freshness.

Complemented by a published seed dump of the popular catalog core (Phase 3) — it removes the
cold-start effect but does not replace lazy backfill for the long tail of queries.

## Considered alternatives

| Option                                | Pros                       | Cons                                                                                                                 | Why not chosen                              |
| ------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Synchronous call to sources on a miss | Simple UX, one request     | Multi-second latency, source limits eaten by user traffic, a source outage = an error response                       | Breaks a fundamental architectural property |
| Seed dump only, no backfill           | Instance useful right away | The long tail of queries is uncovered; the dump goes stale quickly; its size and legal status are a separate problem | Doesn't solve the problem, only softens it  |
| Mass initial import at install time   | Full database              | Hours of work, tens of GB, eating the limits per installation — unacceptable for a home server                       | Incompatible with self-hosting              |

## Consequences

- The public `GET /api/search` contract gains a second response state (`202 pending`) — this
  must be described in OpenAPI and handled in the UI as a distinct "searching the sources…" state.
- A `backfill` queue appears with its own limits and metrics.
- A negative-result cache is needed, otherwise the system self-DDoSes on junk queries.
- An E2E test must cover the "first request in an installation's life" scenario: `202` → wait → `200`.
