# Golden Library Architecture

This document describes the target architecture of the system. It is normative: code must
conform to the layer separation and contracts described here. Deviations are recorded as ADRs
in `docs/adr/`.

---

## 1. System context and boundaries

```
        ┌──────────────┐
        │     User     │
        └──────┬───────┘
               │ HTTPS
     ┌─────────▼──────────┐
     │  Web (Next.js)     │  SSR book card, search, SEO
     └─────────┬──────────┘
               │ REST (JSON, contracts)
     ┌─────────▼──────────┐        ┌──────────────┐
     │  API (NestJS)      │◄──────►│    Redis     │ cache, rate limit, queues
     └─────────┬──────────┘        └──────▲───────┘
               │                          │
     ┌─────────▼──────────┐        ┌──────┴───────┐
     │   PostgreSQL       │        │   Worker     │ BullMQ: sync, imports
     └────────────────────┘        └──────┬───────┘
                                          │ HTTP (rate-limited, retry, circuit breaker)
                           ┌──────────────▼───────────────┐
                           │ External sources:             │
                           │ Open Library, Google Books,   │
                           │ WorldCat, Index Translationum,│
                           │ Gutenberg / Internet Archive  │
                           └───────────────────────────────┘
```

Key property: **a user request never goes synchronously to an external API**.
External sources are polled by workers asynchronously; the result is normalized and stored in
PostgreSQL; reads come from our own DB, warmed through Redis. The only exception is
Phase 0 (the prototype), which exists solely to validate the hypothesis and is then thrown away.

---

## 2. Clean Architecture layers

### 2.1 The dependency rule

Dependencies point **inward only**. An inner layer knows nothing about an outer one.

```
   apps (web / api / worker)          ← composition root, HTTP, DI, cron
        ↓
   infrastructure                     ← adapters: Postgres, Redis, HTTP clients, BullMQ
        ↓
   application                        ← use cases (interactors), orchestration
        ↓
   domain                             ← entities, VOs, domain rules, PORTS (interfaces)
```

`packages/contracts` is a cross-cutting package with Zod schemas of the external API; it is
imported by `apps/web` and `apps/api`, but **not** by `domain` or `application`.

`packages/plugins` is the other cross-cutting package, and it is a **leaf**: it depends on no other
workspace package at all. That is what makes it importable by `apps/web` (bundled into the browser)
and `packages/infrastructure` (Node) at the same time — a necessity, not a convenience, because the
OPDS client must reach servers on the reader's private network and the bookshop lookup must keep
their coordinates off this instance entirely ([ADR-0007](adr/0007-plugin-architecture.md)). Both
constraints are enforced in CI by `pnpm boundaries` (`plugins-is-a-leaf`).

The rule is enforced automatically in CI by `pnpm boundaries` (dependency-cruiser,
`.dependency-cruiser.mjs`), not by reviewer willpower — it resolves package imports
(`@golden/infrastructure` etc.) to real files and fails on any violation of the dependency
direction. `eslint-plugin-boundaries` was tried for this role in stage 1.0, but in the
pnpm + ESM + TS project references setup it failed to resolve `@golden/*` imports between packages
and silently let violations through — it was dropped (docs/adr/0001-clean-architecture-monorepo.md).

### 2.2 domain (`packages/domain`)

Zero external dependencies — no ORM, no HTTP, no `node:fs`, no framework. TypeScript only.

Contains:

- **Entities**: `Work`, `Edition`, `SourceLink`, `Language`.
- **Value objects**: `Isbn`, `LanguageCode` (ISO 639-1), `WorkNaturalKey`, `RightsStatus`,
  `LinkType`, `ProviderId`, `ExternalRef`.
- **Domain rules**: link policy (`LinkPolicy`), title/author normalization,
  edition-merging rules.
- **Ports** (interfaces implemented in infrastructure).

Example of a boundary — the metadata source port:

```ts
// packages/domain/src/ports/book-metadata-provider.port.ts
export interface BookMetadataProvider {
  readonly id: ProviderId;
  searchWorks(query: SearchQuery): Promise<ProviderWork[]>;
  fetchEditions(ref: ExternalRef): Promise<ProviderEdition[]>;
}
```

Port registry:

| Port                    | Responsibility                                | Implementation (Phase 1)                     |
| ----------------------- | --------------------------------------------- | -------------------------------------------- |
| `BookMetadataProvider`  | Fetching works/editions from external sources | `OpenLibraryProvider`, `GoogleBooksProvider` |
| `WorkRepository`        | Read/write `work`, lookup by natural key      | `PgWorkRepository`                           |
| `EditionRepository`     | Read/write `edition`, deduplication           | `PgEditionRepository`                        |
| `SourceLinkRepository`  | Edition links                                 | `PgSourceLinkRepository`                     |
| `ExternalRefRepository` | Mapping "our id ↔ source id"                  | `PgExternalRefRepository`                    |
| `SyncLogRepository`     | Sync journal                                  | `PgSyncLogRepository`                        |
| `IdempotencyStore`      | Storing idempotency keys and responses        | `PgIdempotencyStore`                         |
| `UnitOfWork`            | Transactional boundary of a use case          | `PgUnitOfWork`                               |
| `CachePort`             | Cache for hot queries                         | `RedisCache`                                 |
| `JobQueuePort`          | Enqueueing sync jobs                          | `BullMqQueue`                                |
| `Clock`                 | Current time (test determinism)               | `SystemClock`                                |
| `IdGenerator`           | Id generation (UUIDv7)                        | `Uuid7Generator`                             |

`Clock` and `IdGenerator` are ports not out of dogma: without them a use case is
non-deterministic and idempotency cannot be tested.

### 2.3 application (`packages/application`)

Use cases — one class per scenario, a single public method `execute`. Dependencies arrive
through the constructor as **ports**, never as concrete classes.

| Use case                      | Trigger                       | Idempotency                              |
| ----------------------------- | ----------------------------- | ---------------------------------------- |
| `SearchWorks`                 | `GET /api/search`             | Read, N/A                                |
| `GetWorkCard`                 | `GET /api/works/:id`          | Read, N/A                                |
| `ListEditions`                | `GET /api/works/:id/editions` | Read, N/A                                |
| `GetEditionLinks`             | `GET /api/editions/:id/links` | Read, N/A                                |
| `AggregateTranslationRatings` | `GET /api/works/:id/ratings`  | Read, N/A                                |
| `EnqueueSourceSync`           | `POST /api/sync/:source`      | Idempotency key + jobId dedup            |
| `SyncWorkFromSource`          | BullMQ job                    | Upsert by natural key + external ref     |
| `ImportSourceDump`            | CLI / cron (Phase 2)          | Batched upsert, row-level checkpoints    |
| `RefreshStaleWorks`           | cron                          | Selection by `synced_at`, safe to repeat |

A use case does **not** know about HTTP statuses, Nest decorators, SQL, or Redis. It returns a
result or a domain error; translating to HTTP is the job of the controller in `apps/api`.

### 2.4 infrastructure (`packages/infrastructure`)

Port adapters. Here and only here live: Drizzle schemas and SQL, the Redis client, HTTP clients
for sources (with timeouts, retries with exponential backoff and jitter, circuit breaker,
respect for the source's rate limit), BullMQ, and the "DB row ↔ domain entity" mapping.

Mapping rule: ORM types and source DTOs **do not leave** infrastructure. Domain entities are
what gets returned outward.

### 2.5 apps

- **`apps/api`** — composition root: assembly of the Nest DI container (providers bind ports to
  adapters), controllers, input validation with Zod schemas from `contracts`, rate limiting,
  error handling, OpenAPI.
- **`apps/worker`** — composition root of the workers: BullMQ queue subscriptions, cron
  schedules, graceful shutdown.
- **`apps/web`** — Next.js. Talks to our own API, plus `packages/plugins` for the two modules that
  must execute on the reader's device (their own OPDS catalogs, the bookshop lookup). Knows nothing
  about data sources and contains no business rules beyond presentation.

---

## 3. Data model

The core is the separation of a **work** (`work`) and an **edition** (`edition`): a single book
can have several translations into the same language from different publishers and translators.

```
work 1───* edition 1───* source_link
 │              │
 │              └── language (ISO 639-1)
 └───* external_ref (work|edition ↔ id in an external source)
```

### 3.1 Tables

| Table             | Key fields                                                                                                          | Comment                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `work`            | `id`, `original_title`, `original_language`, `author`, `first_published_year`, `natural_key`, `synced_at`           | `natural_key` — deterministic hash of normalized title+author                                                                                                                                                                                                                                                                                                                                                                              |
| `edition`         | `id`, `work_id`, `title`, `language`, `translator`, `translated_from`, `publisher`, `year`, `isbn13`, `natural_key` | `natural_key` = ISBN-13 if present; otherwise hash(work_id, language, publisher, year, norm(title)). `translated_from` — the source language for this edition; per Phase 0 data it is populated more often than `translator` (16.4% vs 12.2% of editions) — a standalone "this is a translation" signal, not derived from the translator. The edition's source comes via `external_ref`; no dedicated field on the record itself is needed |
| `source_link`     | `id`, `edition_id`, `type`, `url`, `url_hash`, `provider`, `rights_status`, `is_legal_free`, `verified_at`          | `type ∈ {download, buy, borrow}`                                                                                                                                                                                                                                                                                                                                                                                                           |
| `language`        | `code` (ISO 639-1), `name_ru`, `name_en`                                                                            | Reference table, seeded                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `external_ref`    | `id`, `source_name`, `external_id`, `entity_type`, `entity_id`                                                      | Uniqueness of `(source_name, external_id)` is the foundation of idempotent linking                                                                                                                                                                                                                                                                                                                                                         |
| `sync_log`        | `id`, `source_name`, `work_id`, `fetched_at`, `status`, `error`, `job_id`                                           | Audit and observability of syncs                                                                                                                                                                                                                                                                                                                                                                                                           |
| `idempotency_key` | `key`, `endpoint`, `request_hash`, `response_body`, `status_code`, `created_at`, `expires_at`                       | Idempotency of mutating HTTP endpoints                                                                                                                                                                                                                                                                                                                                                                                                     |

### 3.2 Unique constraints (the load-bearing structure of idempotency)

```sql
UNIQUE (work.natural_key)
UNIQUE (edition.natural_key)
UNIQUE (external_ref.source_name, external_ref.external_id)
UNIQUE (source_link.edition_id, source_link.provider, source_link.type, source_link.url_hash)
UNIQUE (idempotency_key.key, idempotency_key.endpoint)
```

Every record from a source goes through `ON CONFLICT ... DO UPDATE`, so re-running a sync does
not create duplicates — this is a property of the schema, not of code carefulness.

### 3.3 Indexes (minimum for Phase 1)

- `work`: GIN trigram on `original_title` and `author` for fuzzy search; btree on `synced_at`
  for selecting stale records.
- `edition`: btree `(work_id, language)`, unique `isbn13` (partial, `WHERE isbn13 IS NOT NULL`).
- `source_link`: btree `edition_id`.
- `sync_log`: btree `(source_name, fetched_at DESC)`.

---

## 4. External API

Base prefix `/api`. All responses are JSON; schemas are described in `packages/contracts` and
exported to OpenAPI.

| Route                                            | Purpose                                                                                                      | Cache             |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ----------------- |
| `GET /api/search?q=&limit=`                      | Search works by title/author                                                                                 | Redis, TTL 10 min |
| `GET /api/works/:id`                             | Card: translation languages, edition summary                                                                 | Redis, TTL 1 h    |
| `GET /api/works/:id/editions?language=&year=`    | Editions with filters                                                                                        | Redis, TTL 1 h    |
| `GET /api/editions/:id/links`                    | Links: download / buy / borrow from a library                                                                | Redis, TTL 6 h    |
| `GET /api/editions/:id/prices?country=`          | Prices and shops, grouped by format                                                                          | Redis, TTL 15 min |
| `GET /api/works/:id/ratings?language=&editions=` | Ratings per edition (needs a Google Books key), links to an edition's reviews (keyless), translator averages | Redis, TTL 24 h   |
| `GET /api/opds/feeds`                            | The OPDS catalogs shipped with the app                                                                       | —                 |
| `GET /api/opds/feeds/:id?href=`                  | One page of a shipped catalog (relay)                                                                        | Redis, TTL 1 h    |
| `GET /api/stores/nearby?lat=&lng=&radiusKm=`     | Bookshops near a point — **opt-in**, 404 off                                                                 | —                 |
| `POST /api/sync/:source`                         | Service-side trigger of a source sync                                                                        | —                 |

Three of these need a word about _why they look the way they do_
([ADR-0007](adr/0007-plugin-architecture.md)):

- **Prices** carry a much shorter TTL than links because a stale price is worse than no price, and
  the response includes a `degraded` list naming any shop that did not answer — a shorter list that
  looks complete is exactly the misinformation the field exists to prevent.
- **`/api/opds/feeds/:id`** takes a feed **id**, never a URL. The optional `href` must resolve onto
  that feed's own origin. It exists only because Project Gutenberg sends no CORS headers; a reader's
  own catalog is fetched by their browser and never passes through here.
- **`/api/stores/nearby`** is disabled unless `ENABLE_SERVER_GEO_LOOKUP=true`, and answers 404 when
  off. `apps/web` does not use it: it runs the same lookup in the browser so coordinates never
  reach this instance.

`POST /api/sync/:source` requires an `Idempotency-Key` header and service authorization
(`X-Admin-Token` in Phase 1, full authorization in Phase 2). A retry with the same key and the
same body returns the stored response and does not enqueue a new job; a retry with the same key
and a different body → `409 Conflict`.

The `GET /api/editions/:id/links` response always contains the explicit rights status of every
link — this is a product requirement and a legal-policy requirement at the same time:

```json
{
  "editionId": "…",
  "links": [
    { "type": "download", "provider": "gutenberg", "rightsStatus": "public_domain", "url": "…" },
    { "type": "buy", "provider": "google-books", "rightsStatus": "copyrighted", "url": "…" },
    { "type": "borrow", "provider": "openlibrary", "rightsStatus": "copyrighted", "url": "…" }
  ]
}
```

---

## 5. Sync flow

```
POST /api/sync/:source  ──► EnqueueSourceSync ──► BullMQ (jobId = source-target-bucket)
                                                        │
                cron RefreshStaleWorks ──────────────────┤
                                                        ▼
                                              SyncWorkFromSource
                                                        │
                    ┌───────────────────────────────────┼───────────────────────────┐
                    ▼                                   ▼                           ▼
          BookMetadataProvider              normalization + natural key     LinkPolicy (filters
          (HTTP, retry, breaker)            edition deduplication           link legality)
                    └───────────────────────────────────┬───────────────────────────┘
                                                        ▼
                                    UnitOfWork: upsert work/edition/source_link/external_ref
                                                        ▼
                                              sync_log + cache invalidation
```

Flow properties:

- **At-least-once**: the queue may deliver a job more than once — the handler must be idempotent.
- **Transactionality**: all writes of a single job happen in one transaction via `UnitOfWork`;
  a partially applied sync does not exist.
- **Source isolation**: a failure or rate limit of one provider does not block the others
  (separate queues and a circuit breaker per provider).
- **Source priority**: on a field-value conflict, the source with the higher priority wins
  (`open-library > google-books` for languages/editions, the reverse order for covers);
  the rule lives in domain, not in an adapter.
- **Read-time sources**: not everything is synced. `LocalizedDescriptionPort` is asked at request
  time, on the work card, for a description in the reader's language — nothing is stored, because
  the answer depends on who is reading, and the alternative is a `description` column per
  interface language. Its only implementation, `WikipediaDescriptionProvider`, joins by
  identifier: the work's Open Library id → Wikidata `P648` → that language's Wikipedia article
  (Redis-cached, misses included). No article, no description — never a fuzzy title match, and
  never a machine translation of the English one.

---

## 6. Caching

Two levels:

1. **PostgreSQL** — the source of truth. Data is already normalized; external APIs are not
   needed to answer.
2. **Redis** — cache for hot responses, key = `v1:{route}:{hash of normalized params}`.

Invalidation is explicit: a successful sync of a work deletes the keys for its `work_id`. The
`v1` version in the prefix allows invalidating everything at once when the response format changes.

Responses that depend on the reader's language carry it in the key — `v1:work:{id}:card:ru`,
`v1:featured:ru` — while the language-free key keeps its old shape, so an instance upgrading into
the feature does not have to warm a whole new key space for requests it already serves.

Target numbers (from the success criteria): cold cache ≤ 2 s, warm ≤ 300 ms.

---

## 7. Observability

- **Logs**: structured JSON (pino), a mandatory `correlationId`, carried end-to-end from the
  HTTP request to the queue job.
- **Metrics** (Prometheus, Phase 3, instrumented from Phase 1): endpoint latency, cache
  hit rate, queue lengths, error counts and remaining quota per external source,
  age of the stalest records.
- **Health**: `/health/live`, `/health/ready` (ready = Postgres and Redis are reachable).

---

## 8. Committed technology decisions

| Decision                      | Reason                                                                                                    |
| ----------------------------- | --------------------------------------------------------------------------------------------------------- |
| pnpm workspaces monorepo      | Clean Architecture layers as separate packages with enforceable import boundaries                         |
| NestJS on Fastify             | DI out of the box for the composition root; Fastify for performance                                       |
| Drizzle ORM instead of Prisma | SQL-first: `ON CONFLICT DO UPDATE` is written explicitly, and generated types do not leak into the domain |
| BullMQ                        | Built-in dedup by `jobId`, retries, schedules; Redis is already in the stack                              |
| Zod in `contracts`            | One schema serves as API input validation and client types                                                |
| UUIDv7 for ids                | Time-sortable without exposing a sequence                                                                 |

Every decision, when revisited, is recorded as an ADR (`docs/adr/NNNN-*.md`).

---

## 9. Deployment and self-hosting

Self-hosting is the **target usage scenario**, not a side effect of containerization.
The project is open source, and running one's own copy must be feasible for a person with a
single server or a home NAS. The requirements below follow from this.

### 9.1 Compose topology

The root `docker-compose.yml` is for self-hosting: it pulls prebuilt images and builds nothing —
**except `web`**. Next.js bakes `NEXT_PUBLIC_*` into the browser bundle at build time rather
than reading them at container start — a prebuilt image from someone else's CI cannot be
reconfigured for your own domain via `.env`, unlike api/worker. Therefore `web` is the only
service this compose builds locally from source with `NEXT_PUBLIC_API_URL` as a build arg (see
`.env.example`). The SSR part of web (the book card) does not suffer from this — it reads the
variable on every request on the server as usual; the baking only affects the two client-side
fetches (search, the links block).
`docker/docker-compose.dev.yml` is for development: builds from source, Postgres and Redis only.

```
docker-compose.yml
├── postgres    healthcheck: pg_isready              volume: pgdata
├── redis       healthcheck: redis-cli ping          volume: redisdata
├── migrate     one-shot, depends_on: postgres healthy
├── api         depends_on: migrate completed_successfully, healthcheck /health/ready
├── worker      depends_on: migrate completed_successfully
├── web         depends_on: api healthy
└── caddy       `tls` profile — optional reverse proxy with Let's Encrypt
```

Key properties:

- **Migrations are a separate one-shot service**, not a step in the application's entrypoint.
  Running migrations from several api replicas simultaneously is a race; a dedicated service
  removes the question.
  `api` and `worker` start via `depends_on: { migrate: { condition: service_completed_successfully } }`.
- **A healthcheck on every service.** Without them, `depends_on` guarantees only that the
  process started, not that it is ready.
- **Named volumes** for Postgres and Redis data; `docker compose down` does not destroy the database.
- **Images with a pinned tag** (`:1.2.3`), not `:latest` — otherwise `docker compose pull` may
  suddenly arrive with an incompatible migration.
- **Multi-arch build** (`linux/amd64`, `linux/arm64`) — so it works on ARM servers and
  home machines.
- **Unprivileged user** in containers, read-only rootfs where possible.
- The only file the user must edit is `.env` (copied from `.env.example`).

### 9.2 Configuration of a self-host installation

The complete and always up-to-date list of variables is in [`.env.example`](../.env.example)
(each one documented right there); the table below covers only those that carry architectural
meaning.

| Variable                     | Required | Comment                                                                                                           |
| ---------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL` / `REDIS_URL` | yes      | In the self-host compose (Phase 1.6) they point at the `postgres`/`redis` services inside the same docker network |
| `ADMIN_TOKEN`                | yes      | Access to `POST /api/sync/:source`                                                                                |
| `PUBLIC_URL`                 | yes      | For correct SSR links and CORS in `apps/api`                                                                      |
| `NEXT_PUBLIC_API_URL`        | yes      | Where `apps/web` sends API requests — must be reachable from the browser, not only from inside the docker network |
| `GOOGLE_BOOKS_API_KEY`       | no       | Works without a key, but with low quotas                                                                          |
| `WORLDCAT_API_KEY`           | no       | Phase 2; most self-host installations will not have one                                                           |
| `CONTACT_URL`                | yes      | Goes into the `User-Agent` of requests to sources — public-API etiquette                                          |

The config is validated by a Zod schema at startup: an installation with a broken `.env` fails
immediately with a clear message, not ten minutes later on the first request.

Missing keys for paid/institutional sources is a normal situation: the corresponding providers
are simply not registered in the composition root, and the system runs on the remaining ones.

### 9.3 The cold database (the key self-hosting problem)

A fresh installation has an empty Postgres. Scheduled sync only fills in what the system
already knows about — that is, nothing. Without a solution the user would see an empty search
and delete the container.

The solution is **lazy backfill on request** (see [ADR-0003](adr/0003-lazy-backfill.md)):

```
GET /api/search?q=…
   └─ in the DB ─────────────────► 200 + results (if data is stale — background refresh)
   └─ not in the DB ──► EnqueueSearchBackfill ──► 202 { status: "pending", pollAfterMs }
                                              │  UI shows "searching the sources…"
                                              ▼
                                    worker polls the providers, upserts, invalidates cache
                                              ▼
                                    the client's repeat request returns 200
```

The rule "a user request does not go synchronously to an external API" is not violated here:
the HTTP handler still only reads its own DB and enqueues a job, while the outbound call is
made by the worker.

Additionally (Phase 3): a published seed dump with a popular core of the catalog, deployed via
`pnpm db:seed:catalog` or a compose profile — so the instance is useful from minute one.

### 9.4 Operating a self-host installation

- **Updating:** `docker compose pull && docker compose up -d`. Migrations are forward-only and
  run automatically via the `migrate` service.
- **Backup:** a documented `pg_dump` command and a recommendation to test restores.
  Redis is not backed up — it is cache and queues; losing it is not critical.
- **Resources:** target minimum — 2 vCPU / 2 GB RAM for the full stack under no load.
  The requirement is verified by measurement in Phase 1, not declared.
- **Logs** go to stdout; collection is left to the host (docker logs / journald).
