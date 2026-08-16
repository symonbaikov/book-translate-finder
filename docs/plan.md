# Golden Library Implementation Plan

The plan is broken into phases from the original brief, with the addition of the technical
scaffolding without which Clean Architecture and idempotency cannot be retrofitted "later".
Each phase ends with a verifiable result.

Related documents: [architecture.md](architecture.md) · [rules.md](rules.md) ·
[legal-policy.md](legal-policy.md).

**Legend:** ✅ done · 🚧 in progress · ⬜ not started · 🚫 blocked by an external constraint
(not a decision to cut scope — the reason is recorded next to the item). Current project status:
**Phase 1 (MVP) is fully complete** — 0, 1.0–1.6 all closed (hypothesis confirmed, see
[coverage-phase0.md](research/coverage-phase0.md)). **Phase 2 is partially closed**: tasks
#67–69 (Open Library Lending, source priority, load testing) are done and
verified live; WorldCat/Index Translationum/AWS CI-CD are blocked by external constraints,
documented honestly in the "Blockers" section of Phase 2, not silently swapped out. **Phase 3 is
closed to the extent achievable without a live owner**: open-source documents, API documentation,
seeding the popular core, security audit, and live UX testing with fixes — done;
monitoring on real traffic, the N→N+1 upgrade test (no released versions exist), and the actual
repository opening/release/announcement — up to a human (marked 🚫 with reasons in the Phase 3 section).

---

## Overview

| Phase | Name               | Estimate  | Main result                                                      |
| ----- | ------------------ | --------- | ---------------------------------------------------------------- |
| 0     | Scouting prototype | 1–2 weeks | Proven that open APIs are sufficient for the product             |
| 1.0   | Monorepo skeleton  | 3–5 days  | Layers, boundaries, CI, Docker — before any business logic       |
| 1     | MVP                | 3–4 weeks | Own normalized DB, synchronization, UI, Docker deployment        |
| 2     | Coverage expansion | 3–5 weeks | WorldCat, Index Translationum, borrowing deeplinks, CI/CD on AWS |
| 3     | Public launch      | 2–3 weeks | Open-source release, documentation, monitoring                   |

Priority goes to Phases 0 and 1: they validate the hypothesis and deliver a working MVP without
sources that require lengthy access negotiations.

---

## Phase 0 · Scouting prototype (1–2 weeks)

**Goal:** validate the hypothesis with a minimal UI and no database of our own. The main question —
are Open Library and Google Books data complete and useful enough for the product to make sense.

**How this phase differs from the rest:** cutting corners is allowed here. The prototype lives in
`prototype/`, does not pass layer-boundary checks, and is **thrown away** at the end of Phase 1.
The only rule that applies here too is the legal policy.

### Tasks

- ✅ `prototype/` — a Next.js search page. **Not literally "no backend"**: Open Library
  has no CORS headers, direct `fetch()` from the browser is blocked — a minimal
  same-origin proxy route was added inside the same app (no DB, no queues, no separate
  service). See the finding in `coverage-phase0.md`.
- ✅ Thin wrapper over the Open Library API (search + editions + languages) — with a correction:
  only the full-text query is used; field-scoped (`title:`/`author:`) drastically undercounts
  recall due to Open Library's poor deduplication of `work` records.
- ✅ Thin wrapper over the Google Books API (metadata, ISBN, purchase link) — not quantitatively
  verified: the anonymous daily quota was exhausted in the working environment before any
  meaningful testing.
- ✅ Display of the translation-language list and archive.org links for editions with a scan
  (the `ocaid` field). Gutenberg was not integrated — Open Library proved sufficient to test the
  hypothesis.
- ✅ Manual labeling of link legal status (a precursor of the future `LinkPolicy`): status
  `has_archive_scan` instead of `public_domain` — the presence of a scan on archive.org does not
  equal public domain (IA also hosts books under controlled digital lending); a deliberate
  decision, not an oversight.

### Data scouting (the main value of the phase)

- ✅ A sample of 50 books: 20 classics/public domain, 20 modern bestsellers,
  10 niche non-fiction, with a spread of original languages (not only English).
- ✅ For each, recorded: how many translation languages were found, how many editions; ISBN and
  translator — on a subsample of 18 books (see below).
- ✅ The result is recorded in [coverage-phase0.md](research/coverage-phase0.md).
- ✅ Limits and latency of both APIs measured, response shapes saved as fixtures in
  [research/fixtures/](research/fixtures/) — including a fixture of the Google Books 429 error itself.
- ✅ Quality of the "translator" field assessed: patchy at the edition level (12.2% of 853
  editions), but at the work level — 17 of 18 checked books have at least one edition with a
  translator.

### Definition of Done

- [x] Clickable prototype: enter "title + author" → list of languages and links (verified live,
      including a working archive.org link).
- [x] `coverage-phase0.md` report with numbers across the 50 books.
- [x] Decision on the goal "≥ 70 % of well-known books find ≥ 3 translations": **goal exceeded** —
      50/50 (100%), a median of 16 languages per book — but the sample consists of deliberately
      well-known books; the decision was made with that caveat (see the report). WorldCat/Index
      Translationum remain in Phase 2; no emergency inclusion in the MVP is required.
- [x] A set of source-response fixtures saved.

Phase 0 closed 2026-08-13.

### Exit/stop condition

The stop condition did not fire: the median of translation languages is 16, against a stop
threshold of < 2. The niche and the plan are confirmed without changes.

### Findings affecting Phase 1 implementation (important not to lose)

- **`OpenLibraryProvider` (§1.3) uses only the plain full-text search query**, never
  `title:`/`author:` field-scoped — otherwise recall drops several-fold (see the methodology in
  the report).
- **Retries with backoff and a circuit breaker on Open Library are not an optional improvement but
  a precondition for getting a complete response at all**: with naive sequential polling
  (1 request/sec, no retries) 76% of requests failed with `ECONNRESET`/timeout. Worth re-checking
  from a regular (not shared cloud) IP before baking exact numbers into the Phase 3 SLA.
- **`GOOGLE_BOOKS_API_KEY` is mandatory already for development**, not only for self-host prod —
  the anonymous quota is exhausted almost immediately.
- **`translated_from` (the original language of a specific edition) is an independent
  "this is a translation" signal**, separate from the translator's name and populated more often;
  it should be used in the Phase 1.1 data model on par with the translator field, not only as its
  fallback.
- The hypothesis is confirmed **for deliberately well-known books**; recall on the long tail of
  niche queries was not measured — a one-off, inexpensive task for the start of Phase 1, does not
  block the start.

---

## Phase 1.0 · Monorepo skeleton (3–5 days)

**Goal:** create a structure in which the rules from `rules.md` are enforced automatically.
Done **before** business logic: layer boundaries added after the fact never stick.

### Tasks

- ✅ pnpm workspaces: `apps/{web,api,worker}`, `packages/{domain,application,infrastructure,contracts}`.
- ✅ TypeScript strict + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`, shared
  `tsconfig.base.json`, project references (`apps/web` — separate, its own tsconfig for Next.js).
- ✅ ESLint + Prettier; **import-boundary checking** (`pnpm boundaries` → dependency-cruiser):
  `domain` has no dependencies, `application` does not see `infrastructure`, `web` does not see
  `infrastructure`/`application`/`domain`. Verified by experiment: a deliberate violation
  (`application` → `infrastructure`, with the dependency declared) fails; `eslint-plugin-boundaries`
  could not resolve such imports in this stack and was ruled out (see [ADR-0001](adr/0001-clean-architecture-monorepo.md)).
- ✅ Vitest: unit + contract + integration projects, Testcontainers for Postgres/Redis (verified
  with a live run — it really spins up containers).
- ✅ `docker/docker-compose.dev.yml`: Postgres, Redis, healthcheck. `docker/app.Dockerfile` —
  a parameterized multi-stage build for api/worker (`pnpm deploy`), built and verified live
  for both apps.
- ✅ Configuration layer: Zod environment schema (`loadEnv`/`baseEnvSchema` in infrastructure, own
  extensions in api/worker/web), fail-fast on startup with an invalid config showing a readable
  list of all errors at once (verified), `.env.example`.
- ✅ NestJS-on-Fastify skeleton: `/health/live`, `/health/ready`, pino with `correlationId`
  (`X-Correlation-Id` from the request or generated), a global domain-error filter
  (`DomainError` → 400/404/409, everything else → an opaque 500).
- ✅ CI on GitHub Actions: `lint → boundaries → typecheck → test → test:integration → build`,
  a summary `ci` job as the single point for the required status.
- ✅ The scripts from the "command contract" in [CLAUDE.md](../CLAUDE.md) work (verified live,
  including `pnpm dev` for all three apps simultaneously).

### Definition of Done

- [x] `pnpm install && pnpm dev` brings up the three apps locally (api :3001, worker, web —
      verified with a live run, including health endpoints and page render).
- [x] A deliberate import from `infrastructure` into `application` fails CI (`pnpm boundaries`).
- [x] `pnpm test:integration` spins up containers (Postgres + Redis via Testcontainers) and
      passes.

Phase 1.0 closed 2026-08-12. `db:generate`/`db:migrate`/`db:seed` and `pnpm sync` are deliberate
stubs with a clear message until Phase 1.2/1.3, not "empty" implementations.

---

## Phase 1 · MVP (3–4 weeks)

**Goal:** our own normalized database instead of on-the-fly API queries. A working service,
deployed in a Docker container.

### 1.1 Domain and data model ✅ (closed 2026-08-13)

- ✅ Entities `Work`, `Edition`, `SourceLink`, VOs `Isbn`, `LanguageCode`, `RightsStatus`, `LinkType`,
  `ProviderId`, `ExternalRef`. `Edition` was extended with a `translatedFrom` field beyond the
  original plan — a Phase 0 finding showed it is populated more often than the translator's name
  (16.4% vs 12.2% of editions) and is an independent "this is a translation" signal.
- ✅ `normalizeText()` and natural-key computation (sha256 via `node:crypto` `createHash`,
  determinism — under 40+ table-driven tests). A table-driven test on Cyrillic caught a real bug:
  NFKD decomposition turns «й» into «и» + breve, and naively stripping all combining marks
  breaks Cyrillic — fixed by restricting the strip to Latin diacritics only.
- ✅ `LinkPolicy` with all invariants and tests from [legal-policy.md](legal-policy.md) (24 tests).
  The denylist was refined during implementation: full domains + exact-or-subdomain matching
  instead of short fragments — the fragment approach produces false positives on coincidentally
  similar domains.
- ✅ Edition merge rules and source priority on field conflicts (`resolveFieldConflict`,
  parameterized by field category — metadata vs cover).
- ✅ Ports: repositories, `BookMetadataProvider`, `UnitOfWork`, `CachePort`, `JobQueuePort`,
  `Clock`, `IdGenerator`, `IdempotencyStore` — narrow, one per file, no extraneous methods.
- ✅ In-memory implementations + a shared contract-test suite for `WorkRepository`, `EditionRepository`,
  `SourceLinkRepository`, `ExternalRefRepository`, `IdempotencyStore` (upsert semantics verified
  explicitly: a repeated `save()` with a new id updates the fields but keeps the original id — like
  `ON CONFLICT DO UPDATE` in a real DB). Simple fakes without dedicated contract suites — for
  `CachePort`, `JobQueuePort`, `Clock`, `IdGenerator`.
- ✅ A side result, but an important one: a gap in the Phase 1.0 tooling was found and closed —
  test coverage was not configured at all (`@vitest/coverage-v8` was not installed). Added;
  `pnpm test:coverage` checks `packages/domain` at ≥90% (currently 100%/99.3% branch), wired into
  CI as a separate job. Thresholds are scoped to domain for now — to be widened as tested logic
  appears in the other packages, not before.

### 1.2 Storage ✅ (closed 2026-08-13)

- ✅ Drizzle schema: `work`, `edition`, `source_link`, `language`, `external_ref`, `sync_log`,
  `idempotency_key`. All id/reference columns are `text`, not native Postgres `uuid`: a finding
  made right in the process — the `IdGenerator` port from Phase 1.1 deliberately does not require
  a specific format, and the contract suite intentionally uses short readable ids like `"work-1"`;
  native `uuid` rejects those (`invalid input syntax for type uuid`), caught by an integration test.
- ✅ Unique constraints on the natural key and `(source_name, external_id)`, plus a composite key
  `source_link (edition_id, provider, type, url_hash)` and PK `idempotency_key (key, endpoint)`.
- ✅ A `CHECK` constraint on illegal `type`/`is_legal_free` combinations, plus CHECKs on all
  text enum-like fields (`rights_status`, `entity_type`, `status`) — storage-level protection,
  independent of the domain code.
- ✅ Indexes: trigram (GIN, `gin_trgm_ops`) on `original_title`/`author` — added manually
  via `drizzle-kit generate --custom`, Drizzle does not support this operator class natively;
  `(work_id, language)`; partial unique on ISBN-13.
- ✅ The first migration (`drizzle/0000_*.sql` + `0001_trigram_indexes.sql`), seeding the language
  reference table from the domain's `LANGUAGE_NAMES` (`pnpm db:seed`, idempotent — verified by a
  repeat run).
- ✅ Postgres repository implementations (`Pg{Work,Edition,SourceLink,ExternalRef,SyncLog}Repository`,
  `PgIdempotencyStore`) with `ON CONFLICT DO UPDATE`, where `id` is deliberately excluded from
  `SET` — a conflicting record keeps its original id, just like a regular insert not in SET.
  **The contract suites from Phase 1.1 were reused literally**, without rewriting for Postgres —
  exactly what they were created for. The "double run creates no duplicates" test
  (docs/rules.md §2.6) is not a separate test but a direct consequence of the contract suite
  already checking this and now running against a real DB via Testcontainers (26 tests, including
  the harness).
- ✅ A side finding: two contract suites (`Edition`, `SourceLink`) had to be extended with an
  optional hook (`ensureWorkExists`/`ensureEditionExists`, no-op by default) — the in-memory
  fake does not check referential integrity, while the real FK on `edition.work_id`/
  `source_link.edition_id` requires the parent record to exist. The hook is a parent-row
  precursor only for integration runs; the Phase 1.1 in-memory tests are behaviorally unchanged.
- ⬜ **`PgUnitOfWork` deliberately not implemented** in this phase. A naive wrapper around
  `db.transaction()` that does not pass the transactional handle to the repositories inside
  `work()` would look functional but would provide no real atomicity — worse than openly
  deferring. A transaction-context mechanism is needed (a `Queryable` type on the repositories +
  `AsyncLocalStorage` or an explicit scope object), which should be designed together with a real
  multi-table scenario (`SyncWorkFromSource`, §1.3), not blindly.

### 1.3 Sources and synchronization ✅ partially (closed 2026-08-13, Cron/backfill deferred to 1.4)

- ✅ **`PgUnitOfWork` + transaction-context** (deferred from §1.2, implemented here together with
  the first real multi-table scenario, as planned): `AsyncLocalStorage<Queryable>`
  (`transaction-context.ts`) + `resolveDb(fallback)`; each `Pg*Repository` gained a private
  getter `private get q() { return resolveDb(this.db); }` and all queries now go through `this.q`,
  not directly through `this.db`. `PgUnitOfWork.runInTransaction` wraps `db.transaction(tx =>
runWithTransactionContext(tx, work))` — repositories participate in the transaction transparently,
  without knowing about it explicitly. Verified by integration tests directly for atomicity
  (commit, rollback, isolation outside the transaction) and indirectly — by a full
  `SyncWorkFromSource` run against a real Postgres.
- ✅ `RedisCache implements CachePort`: `SCAN`+`UNLINK` for `deleteByPrefix` (not `KEYS`+`DEL` — a
  blocking operation in production), TTL via `SET ... PX`. 6 integration tests, including a real
  TTL expiry.
- ✅ HTTP resilience toolkit (`createResilientFetcher`): cockatiel `retry` (exponential
  backoff with built-in jitter) + `circuitBreaker` (ConsecutiveBreaker) + `timeout`
  (Aggressive), composed via `wrap()`. Only 5xx are retried — a 4xx means "the request itself is
  wrong", a retry will not help. All 6 tests run against a real local HTTP server, not a mocked
  `fetch`, because timeouts/retries/circuit-breaker state are exactly what a mock cannot honestly
  verify.
- ✅ `OpenLibraryProvider`: plain-text search only (`q: query.text`), never field-scoped
  (`title:`/`author:`) — a direct consequence of the Phase 0 finding. Adapter-level cache (1h
  search, 6h editions) via `CachePort`. `rightsSignal` is always `'unknown'` — honestly:
  `editions.json` gives no reliable per-edition rights signal, and the presence of `ocaid` by
  itself does not prove public domain. Smoke-tested against the live Open Library API separately
  from the unit tests on real fixtures.
- ✅ `GoogleBooksProvider`: Google Books has no "work" grouping — each search result
  maps to a `ProviderWork` with one implied edition; `fetchEditions` re-fetches
  exactly that volume. Extracts ISBN-13/10 and `link: { type: 'buy', url }` when
  `saleInfo.saleability === 'FOR_SALE'`.
- ✅ Use case `SyncWorkFromSource`: search top-match → provider editions → inside
  `unitOfWork.runInTransaction`: resolve/create `Work` (external_ref → then natural key) →
  for each edition resolve/create `Edition` likewise, **skip (not fail)** on an unparsable
  language/ISBN → attempt `assertLinkAllowed` for the provider's link, skip on `DomainError`
  (the provider offering it does not mean `LinkPolicy` allows it), rethrow on other errors →
  cache invalidation by prefix `v1:work:{id}` → write `sync_log` (on error — outside the
  transaction, so the audit trail survives a rollback). 7 unit tests on local fakes + 4
  integration tests against real Postgres/Redis, including an explicit rollback check.
- ✅ BullMQ: `BullMqQueue implements JobQueuePort`, deterministic `jobId` = dedup key
  (a repeated `enqueue` with the same `jobId` while the job is waiting/active/delayed is a no-op).
  No separate physical DLQ was created — `removeOnFail: false` already keeps failed jobs
  inspectable, which is simpler than a second queue for the same data. 4 integration tests,
  including a real BullMQ worker and an explicit DLQ-inspection check.
- ✅ **A side finding, an important one**: BullMQ **does not accept `:` in `jobId`** (`Custom Id cannot contain
":"`, caught by an integration test when trying to use the already documented format
  `sync:{source}:{workId}:{date}`). The convention was changed everywhere to dashes:
  `sync-{source}-{workId}-{date}`. Updated everywhere the format was documented:
  `docs/rules.md` §2.3 (with an explanation of the BullMQ limitation added), `docs/architecture.md` §5,
  `docs/adr/0002-idempotency-strategy.md`, `docs/adr/0003-lazy-backfill.md`. `BullMqQueue.enqueue`
  additionally validates and throws a clear `InvalidInputError` instead of letting BullMQ's
  internal error bubble up.
- ✅ **A side finding, critical for data coverage**: Open Library returns languages in ISO 639-2/B
  (the three-letter "bibliographic" code — `eng`, `rus`, `ger`, `fre`, `chi`...), while the
  `LanguageCode` from Phase 1.1 understood only two-letter ISO 639-1. Without the fix, **almost
  all** Open Library editions would silently be skipped as "unparsable language". Caught not by a
  test on invented data, but by the fact that the `SyncWorkFromSource` tests were written from the
  start on real three-letter fixtures — direct confirmation of the practice of "testing on
  realistic data", not on convenient two-letter stubs. Fixed: `iso-639-2-to-1.ts` — a table of
  ~87 mappings; `LanguageCode.create()` first tries `LANGUAGE_NAMES` (2 letters), then this
  table, otherwise throws `InvalidInputError`.
- ✅ Edition deduplication: `computeEditionNaturalKey` (language, publisher, year, title) already
  existed since Phase 1.1 — used as is in `SyncWorkFromSource`; ISBN-13 participates in the key
  when recognized.
- ⬜ **The `RefreshStaleWorks` Cron and the lazy backfill queue ([ADR-0003](adr/0003-lazy-backfill.md))
  deliberately deferred to §1.4.** Both need a working `apps/worker` composition root
  (a real provider registry assembled from config, plus BullMQ repeatable-job scheduling),
  which does not yet exist — building them in isolation now would mean untested scaffolding. The
  same logic that deferred `PgUnitOfWork` from §1.2 to §1.3: the right phase for a mechanism is
  the one with the first real scenario it can be meaningfully verified against.
- 📝 A known, documented workaround: the `SyncWorkFromSource` unit tests define
  local fakes right in the test file (`packages/application/test/use-cases/`) rather than reusing
  `packages/domain/test/fakes/*` — on the first attempt the import chain
  `application/test → domain/test/fakes → domain/src` (the only case of a double hop between
  packages in the project at that time) failed in Vite with a module-resolution error. Separately,
  during the final check of the command contract, it turned out that some domain test directories
  (`packages/domain/test/fakes/*.js`/`*.d.ts`) contained compiled artifacts left over from an
  earlier `tsc` run right next to the `.ts` sources — they intercepted resolution ahead of the
  `.ts` files and broke the domain contract tests in the same way. The artifacts were removed,
  `pnpm test` is green again across all 29 files; this was probably the real cause of that earlier
  failure too, but the local fakes in the `SyncWorkFromSource` tests were not converted back — a
  working and deliberate decision, left untouched.

### 1.4 API ✅ (closed 2026-08-13)

- ✅ Zod schemas in `packages/contracts` for the entire API surface (`search`, `work`, `edition-links`,
  `sync`, shared `error`), with table-driven unit tests for each.
- ✅ Domain: `WorkSearchPort` (Postgres-specific ranked search — deliberately a separate
  port from `WorkRepository`, docs/rules.md §1 ISP) and `WorkRepository.findStale()` for the Cron.
  Implementation — `PgWorkSearchAdapter` on `similarity()`/`gin_trgm_ops` (indexes already existed
  since Phase 1.2) plus an `ILIKE` fallback for short queries where trigram similarity is too weak.
- ✅ Use cases in `packages/application`: `SearchWorks` (lazy backfill, ADR-0003), `GetWorkCard`,
  `ListEditionsForWork`, `GetEditionLinks` (all — with a Redis cache via `CachePort`, TTLs from
  docs/architecture.md §4), `EnqueueSourceSync` (Idempotency-Key, docs/rules.md §2.4),
  `RefreshStaleWorks` (Cron), `ProcessBackfillJob` (consumer of the `backfill` queue).
- ✅ `apps/worker`: composition root (`buildWorkerContext`) registers both providers
  (`open-library`, `google-books` — Google Books works even without a key, just with a lower
  limit, docs/architecture.md §9.2, so it is not excluded from the registry), three BullMQ `Worker`s
  (`sync`, `backfill` — with lower concurrency, ADR-0003, `cron-refresh-stale-works` —
  `upsertJobScheduler`, daily, which comfortably exceeds the "at least once a
  week" requirement). `pnpm sync -- --source=<name> --work=<workId>` (a stub since Phase 1.0) is
  finally implemented for real.
- ✅ `apps/api`: `SearchController`, `WorksController`, `EditionsController`, `SyncController`
  (a guard on `X-Admin-Token` via a new `UnauthorizedError` — 401 — in the domain error
  hierarchy, the same `DomainErrorFilter` as the other codes). DI — a `@Global() InfrastructureModule`
  assembling the use cases once at startup (`buildApiContext`), the same composition-root
  pattern as in `apps/worker` (Phase 1.3). Redis-backed rate limiting (`@fastify/rate-limit`,
  60 requests/min per IP).
- ✅ `POST /api/sync/:source`: only enqueues a job into the same `sync` queue as the Cron — the
  `SyncWorkFromSource` itself never runs in the API process (docs/architecture.md §5, the flow
  diagram). This required reworking, on the fly, the first draft of `SyncResponseSchema` (initially
  mistakenly modeled as a synchronous response with sync results) into `{status: 'queued',
jobId, replayed}`.
- ✅ The full ADR-0003 cycle verified live against the real Open Library + Postgres + Redis:
  search miss → `202 pending` → the worker actually syncs the book → repeated request → `200 found`
  (docs/plan.md — the "first-ever request of an installation" from the ADR-0003 Definition of Done).
- 🐛 **Four real findings caught only by a live run** (not by tests, not by typechecking —
  only catchable when a real HTTP request goes through a real process):
  1. `app.setGlobalPrefix('api', ...)` was forgotten — all routes were mounted without `/api`.
  2. **NestJS reverses the array of global exception filters** (`filters.reverse()` in
     `RouterExceptionFilters`) before matching — meaning of two `app.useGlobalFilters(A, B)`,
     **B** is checked first, not A. The order `useGlobalFilters(DomainErrorFilter,
UnhandledErrorFilter)` — intuitively correct-looking — in practice meant that the
     catch-all `UnhandledErrorFilter` (`@Catch()` with no arguments matches everything) intercepted
     `NotFoundError`/`ConflictError`/`UnauthorizedError` before the specific
     `DomainErrorFilter`, turning honest 404/409/401 into a generic 500. The order was fixed to
     `(catch-all, specific)`; an explicit test for the code-to-status mapping was added.
  3. `UnhandledErrorFilter`, catching absolutely everything (`@Catch()`), also swallowed Nest's
     own exceptions (`NotFoundException` for a nonexistent route) and Fastify plugin errors
     (`@fastify/rate-limit` throws a plain `Error` with a `statusCode` field, not an `HttpException`) —
     both cases turned into a 500 instead of honest 404/429. The filter was taught to recognize
     both cases explicitly and translate their real status.
  4. **The trigram search threshold of 0.1 was too lenient**: a query for a nonexistent book ("The
     Little Prince Saint-Exupery") matched "The Hobbit" with a similarity of 0.1025 — solely due
     to the shared word "The". Raised to 0.3 (the `pg_trgm` default itself); a
     regression integration test for this specific case was added.
- 📝 **A known limitation, not a bug**: search compares the query only against `work.original_title`/
  `author` (the work's original language), not against translated edition titles. A live test
  on «Le petit prince» / query "The Little Prince" (0.237 similarity — below the new 0.3 threshold)
  showed: until the job is synced, this looks like a regular `pending`, which is honest and does
  not break the contract — but after a successful sync, a query for the English title still fails
  to find the French original work on trigram title/author similarity alone. The full
  solution (also indexing `edition.title` across all languages) is a notably larger amount of
  work, deliberately deferred to Phase 2 rather than quietly bolted on now.
- 📝 `ProcessBackfillJob` sets the 24-hour negative cache (ADR-0003) only when **all**
  registered sources returned a clean `not_found` — if even one returned `error`
  (timeout, unavailability), the cache is not set, so a transient failure does not freeze the
  result for a day. A deliberate compromise, not a full per-source retry model.
- ⬜ **OpenAPI generation from the Zod schemas not done** — deliberately deferred: a working,
  live-verified contract matters more than a documentation artifact at the end of an already
  large phase; the Zod schemas are already the machine-readable source of truth and can be run
  through `zod-to-openapi` at any moment without changing the API itself.

### 1.5 Web ✅ (closed 2026-08-13)

- ✅ `apps/web/src/lib/api-client.ts` — the single entry point into the API: every response is
  validated by a Zod schema from `@golden/contracts` before reaching a page (docs/architecture.md §2.5 —
  apps/web knows nothing about data sources and business rules, only about its own API).
  `getWorkCard` returns `null` on `404` (a deliberate decision — the calling page decides how to
  present it), any other non-2xx throws `ApiRequestError`.
- ✅ Search page (`/`): the `SearchBox` client component — input, candidate list
  (`GET /api/search`), states `idle`/`loading`/`found`/`not_found`/`error`; a result is a link
  to the card.
- ✅ The `202 pending` state (ADR-0003, "searching the sources…") with polling every `pollAfterMs`
  as directed by the server and a sensible timeout — up to 8 attempts (~24 s), after which an
  explicit message instead of infinite polling. Races of stale responses ruled out with a
  `requestId` counter.
- ✅ Book card `/works/[id]` — **SSR** (Server Component, `fetch(..., {cache:'no-store'})`):
  translation languages, edition list, language/year filter via `<form method="get">` and
  `searchParams` (works without JS, the URL is the source of truth for the filter). `notFound()`
  for a nonexistent `workId`.
- ✅ The links block (`EditionLinks`, client-side, expands on click — it does not fetch links for
  all editions at once, only when the user asks) — badges `public domain` / `open license` /
  `copyrighted` / `status undetermined`, link-type labels "Download" /
  "Buy" / "Borrow from library" (requirement I-4). Loading/error/explicit "no links yet"
  states — never confused with an error.
- ✅ Minimal a11y: `<label htmlFor>` on all fields, `aria-live="polite"` on search results
  and the links block, `aria-expanded` on the expander button, a skip-link to `#main-content`,
  light/dark theme via `prefers-color-scheme`.
- ✅ Playwright e2e (`apps/web/e2e`, `pnpm test:e2e`) — the "search → card → links" scenario
  (docs/rules.md §5). It **creates its own data** via `POST /api/sync/:source` (the same
  documented admin endpoint) instead of relying on a pre-populated DB —
  deterministic, and works on a fresh database too. Run live twice: once when the book was
  already in the database (the instant path), once from scratch on a new book ("Matilda") with a
  really running `apps/worker`, to prove that the polling loop in `beforeAll` does not merely
  coincide with already-prepared data.
- ✅ A live browser check (see below) on top of the real api+worker+Postgres+Redis stack:
  search, a card with 41 real editions of "The Hobbit", the language filter (4 of 41 for `ru`),
  expanding the links block with an honest "no links yet" (there is no real link data yet —
  `LinkPolicy`/providers do not yet return populated links for most editions), the 404 page.
- 🐛 **Side findings, not directly related to the Web phase but caught during the live check of
  the full from-scratch dev flow**:
  1. `apps/web`'s relative imports (`'../lib/api-client.js'`) did not build under Next's webpack —
     `moduleResolution: "Bundler"` in `apps/web/tsconfig.json` (unlike `NodeNext` in all the
     other packages) does not work with an explicit `.js` extension on not-yet-compiled
     `.tsx` files; `tsc --noEmit` stayed silent (passed) — only a real
     `next build` catches it. All internal `apps/web` imports were switched to extensionless paths.
  2. **The startup sequence documented in CLAUDE.md (`pnpm install` → `docker compose up -d` →
     `pnpm dev`) had actually been broken since Phase 1.0** — the
     `cp .env.example .env` step was missing everywhere, and `pnpm db:migrate`/`db:seed`/`pnpm sync`
     did not load `.env` at all (`tsx` without `--env-file`). Plus a separate problem: Next.js
     reads env files only from **its own** directory (`apps/web/.env.local`), not from the
     monorepo root — the `NEXT_PUBLIC_API_URL` variable from the root `.env` physically never
     reaches `apps/web`. All of this was discovered not by tests but by honestly retracing the
     documented flow from scratch. Fixed:
     `db:migrate`/`db:seed` — `tsx --env-file-if-exists=../../.env` (does not fail if the file is
     absent — important for prod/CI where the variables are already in the environment);
     `pnpm sync` — `tsx --env-file=../../.env` (strict, like `dev`); a tracked
     `apps/web/.env.example` was added; CLAUDE.md and `.env.example` updated with the missing steps.
  3. `.gitignore` did not cover `.env.local` (only `.env.*.local` — with a mandatory dot between
     `.env` and `.local`; Next.js's pattern `.env*.local` differs by one character) — `apps/web`'s
     local env file nearly ended up in git. Fixed together with finding #2.

### 1.6 Docker and self-hosting ✅ (closed 2026-08-13)

Self-hosting is the target scenario, not a side effect of containerization
(see [architecture.md §9](architecture.md#9-deployment-and-self-hosting)).

- ✅ Multi-stage Dockerfile for api/worker (`docker/app.Dockerfile`, parameterized by
  `APP_NAME`, existed since Phase 1.0) and for web (`docker/web.Dockerfile`, new — Next.js
  standalone output, separate from the `pnpm deploy` pattern of api/worker). Plus
  `docker/migrate.Dockerfile` — a one-shot service. All three — unprivileged user, minimal final
  layer.
- ✅ Root `docker-compose.yml`: postgres, redis, migrate, api, worker, web, optional
  `caddy` (the `tls` profile). A healthcheck on every service (api/web — via `node -e` with a real
  HTTP request, not `wget`/`curl`, which may be absent in `node:alpine`), named volumes
  for Postgres/Redis. `postgres`/`redis` publish no ports at all — self-host does not need
  access to them from outside the docker network, unlike the dev compose.
- ✅ `migrate` — a separate one-shot service (`docker/migrate.Dockerfile`); `api`/`worker` start
  via `depends_on: { migrate: { condition: service_completed_successfully } }`. Verified
  live against a real empty Postgres: applies 7 tables + seeds 87 languages; a repeat
  run is idempotent (as per the Phase 1.2/1.3 findings about `ON CONFLICT`).
- ✅ `.env.example` extended for self-host: `POSTGRES_PASSWORD` (compose itself assembles
  `DATABASE_URL`/`REDIS_URL` from it for the services inside its own network — the self-hoster
  does not need to hand-rewrite connection strings to `postgres`/`redis`), `IMAGE_TAG`, `DOMAIN`
  (for `tls`).
- ✅ Optional `tls` profile (`docker compose --profile tls up -d`) with Caddy
  (`docker/Caddyfile`) — a single public domain, `/api/*` and `/health/*` route to api,
  everything else — to web; automatic Let's Encrypt via Caddy itself.
- ✅ CI workflow `.github/workflows/release.yml`: multi-arch build (`linux/amd64`,
  `linux/arm64`) of api/worker/migrate images via `buildx`+QEMU, published to GHCR with a
  semantic tag on a `v*.*.*` tag push. **`web` is deliberately not published** — see the
  `NEXT_PUBLIC_API_URL` finding below. The file was written and validated as YAML, **never run** —
  a real tag push would have created public images in GHCR, which was deliberately not done
  without the user's explicit permission.
- ✅ The "clean machine" check — live, locally: all images built under the same tags that
  compose uses, the full self-host stack brought up (not dev), the "first request on an empty
  installation" scenario walked through: `202 pending` → the worker actually syncs from Open
  Library → repeated request → `200 found`, and entirely through the SSR card and client-side
  search (not a single Node process on the bare host — containers only). A real `git clone` on a
  literally clean machine and publishing to GHCR were not performed (see the deferred items below).
- ✅ Idle-stack resource measurement: postgres 32 MiB + redis 9.6 MiB + api 41 MiB +
  worker 38 MiB + web 30 MiB ≈ **151 MiB total**, CPU ~0% at idle — fits into the target
  2 vCPU / 2 GB RAM with a large margin.
- ✅ Upgrade (`docker compose pull && docker compose up -d`) — migrations run automatically
  via `migrate` on every `up`. Backup: `pg_dump | gzip` verified live — restored into a
  separate clean Postgres, row counts (`work`/`edition`) matched the original, no errors during
  restore.
- ✅ Structured logs to stdout — pino JSON under `NODE_ENV=production` (see the CORS/logs finding
  below), `correlationId` end-to-end since Phase 1.0. Metrics — confirmed as deferred to Phase 3,
  as originally planned.
- ✅ `domain`+`application` coverage ≥ 90% is now actually measured in CI (`pnpm test:coverage`),
  not just `domain` — the scope was widened in this phase: `application` accumulated enough
  tested logic over Phases 1.3–1.4 (99.08% stmts / 94.56% branch across both packages together),
  the threshold passes with margin.
- 🐛 **Four real findings caught only by actually bringing up the self-host compose** (no unit or
  integration test would have caught them — only real containers in a real
  docker network):
  1. **Docker by default sets `HOSTNAME` to the container id**, and the Next.js standalone
     `server.js` listens on exactly the host in `HOSTNAME` — the server listened only on the
     container's own bridge IP, refusing connections on `127.0.0.1`/`localhost` (including the
     healthcheck, which runs from inside the container). From outside, through the published
     port, everything worked (Docker NAT does not care what the process is bound to), masking the
     problem under a superficial check. Fixed with `ENV HOSTNAME=0.0.0.0` in `web.Dockerfile`.
  2. **NEXT_PUBLIC_API_URL is baked into the browser bundle at build time** — a constant
     suitable for the browser (the public domain) is physically unreachable from SSR code running
     **inside** the web container (`localhost:3001` inside the container is the web container
     itself, not api). The book card (SSR) would silently fail in the self-host compose while
     working perfectly in Phase 1.5 (there, web and api both run on the bare host, `localhost` is
     the same for both). Solution: a second, NON-`NEXT_PUBLIC_` variable `INTERNAL_API_URL`
     (`http://api:3001`, set right in `docker-compose.yml`, requiring no action from the
     self-hoster) — read only on the server (`typeof window === 'undefined'`), never shipped to
     the browser. Also because of this same constraint, `web` is the only service the self-host
     compose builds locally instead of pulling prebuilt (see the `architecture.md §9.1` edit).
  3. `.env.example`'s shared `NODE_ENV=development` (correct for `pnpm dev`) would silently leak
     into self-host: `apps/api` enables CORS `origin: true` (allow everything) and pretty-printed
     logs instead of structured JSON only when `NODE_ENV !== 'development'`. The "three commands"
     would have produced an instance with fully open CORS. Fixed: `docker-compose.yml` sets
     `NODE_ENV: production` for api/worker explicitly, the same way
     `DATABASE_URL`/`REDIS_URL` were already overridden.
  4. Docker Compose **does not substitute the values of some `.env` variables into others**
     (`${VAR}` inside `.env` does not work — only in the compose file itself) — an early draft
     tried to write `DATABASE_URL=postgres://btf:${POSTGRES_PASSWORD}@postgres:5432/btf` right in
     `.env.example` and would not have worked. The solution is the same as for finding #3:
     assemble such values in the `environment:` of `docker-compose.yml` itself, not in `.env`.
- 📝 **Cannot be done by me, requires a real user**:
  - "An outside person deploys an instance on a clean machine following the README in three
    commands" — by definition requires an outside person. The README is written and designed for
    exactly this scenario (see the repository root); the actual check by a live human has not been
    done.
  - Actual publication of images to GHCR (`.github/workflows/release.yml`) was not triggered — a
    version-tag push would have created public artifacts in a real registry without the user's
    explicit permission for that action.
  - The multi-arch `arm64` build was not built locally in this session (QEMU emulation in this
    sandboxed environment would have been slow/resource-hungry with no real practical benefit —
    the buildx step logic in CI is standard and not tied to a specific host architecture).

### Definition of Done

- [x] The user's response is assembled **only** from our own DB; there are no synchronous calls to
      external APIs from an HTTP handler (backfill goes through the queue).
- [x] Re-running synchronization for the same work does not change data and creates no duplicates (tested).
- [x] The first-request-on-an-empty-installation scenario is covered by E2E: `202` → wait → `200` —
      both by the Playwright scenario (Phase 1.5) and by the live check on the self-host compose in
      this phase.
- [x] The Phase 0 prototype is deleted.
- [x] `domain` and `application` coverage ≥ 90 %, overall ≥ 80 % — now actually measured in CI
      (see the finding above), not just declared.
- [x] All legal-policy tests are green.
- [ ] An outside person deploys an instance on a clean machine following the README in three
      commands (verified on a live human, not the author) — **not done by me, see the findings above**.
- [x] Measurements: cold cache ≤ 2 s, warm ≤ 300 ms on the Phase 0 sample — measured live:
      cold `/api/works/:id` — 14 ms, warm — 2.4 ms; similarly for search/editions/links —
      everything within single-digit to tens of milliseconds, with a large margin from the targets.

### Explicitly NOT in Phase 1

User accounts, favorites, recommendations, mobile app, WorldCat,
Index Translationum, multi-regional deeplinks.

---

## Phase 2 · Coverage expansion (3–5 weeks)

**Goal:** improve data completeness and add rare languages. Every new source is a new
implementation of an existing port, without rewriting use cases (the Open/Closed principle in
practice).

### Tasks

- 🚫 Requesting WorldCat Search API access (an institutional key) — **blocked by an external
  constraint**, see "Blockers" below.
- 🚫 `WorldCatProvider` as an implementation of `BookMetadataProvider` — blocked by the same
  (no API access, there is nothing to implement an adapter against).
- 🚫 Importing Index Translationum dumps: batches with checkpoints in `sync_log`, a restart
  resumes from the last checkpoint, re-running a batch is safe — blocked, see "Blockers" below.
- 🚫 Matching historical Index Translationum records with existing `work`s (matching
  on normalized fields, manual sample verification of merge quality) — blocked by the same.
- ✅ Deeplinks to legal borrowing — Open Library Lending: `OpenLibraryProvider` calls
  `/api/volumes/brief/json/...` (undocumented, but a real and stable Read API), matches
  `match: 'exact'`, distinguishes `full access` (→ `public_domain`/`download`) and
  `lendable`/`checked out` (→ `copyrighted`/`borrow`); the link provider is `internet-archive`,
  not `open-library` (see the doc comment on `ProviderEdition.link` and docs/legal-policy.md I-1).
  A live check on "1984" (Orwell) exposed two real problems, both fixed: (1)
  `editions.json?limit=50` does not guarantee that among the first 50 of 536 editions there is
  even one edition with real availability — fixed with a second, independent request over the
  work's `ia` list from `search.json` (note: the correct query-key prefix is `ocaid:`, not `ia:`
  — the latter silently returns `{}`, verified live); an edition found outside the
  already-loaded batch is fetched additionally via `/books/{OLID}.json`, capped at
  `MAX_EXTRA_AVAILABILITY_EDITIONS = 5` per synchronization. (2) A separate finding unrelated to
  this task: some editions have `language: 'und'` and are deliberately skipped by the existing
  (Phase 1.3) `SyncWorkFromSource` logic as an unrecognizable language — this can hide a real
  link to a specific edition; recorded as a known limitation, outside the scope of this task.
  Result of the live check on the real stack (Postgres + Redis + real HTTP requests): "1984" →
  5 real borrow links to archive.org with `provider: internet-archive`,
  `rights_status: copyrighted`. Libby/OverDrive not integrated — they have no public open API
  without a library partnership agreement, outside the scope of the current session.
- ⬜ Regional purchase deeplinks — affiliate programs optionally, with mandatory disclosure of
  affiliate status. Not started: an optional plan item requiring real affiliate agreements
  (Amazon Associates and the like), which the project does not have — deliberately not
  pursued in this session, not a blocker.
- ✅ Source priorities on field conflicts, showing the fact's source in the UI —
  `resolveFieldConflict` (Phase 1.1) is woven into `SyncWorkFromSource`: before overwriting
  work/edition fields on resync, `shouldApplyMetadata` asks `ExternalRefRepository.findSourcesForEntity`
  (a new port method, implemented in the Pg adapter and the in-memory fake, covered by the
  contract suite) — which sources have ever touched this entity — and decides via
  `resolveFieldConflict('metadata', ...)` whether the current source wins priority; if not, the
  fields are not overwritten (for work only `syncedAt` is bumped, for edition the fields stay as
  they are). `GetWorkCard` returns `sources: string[]` (the list of all sources that have ever
  contributed to the work, sorted alphabetically — not by priority, which is an internal detail
  of the sync), and the work card on web shows
  "Data source: …". A live check on the real stack (Postgres + running `apps/api` +
  `apps/web`): `GET /api/works/:id` returned `sources: ["google-books", "open-library"]`, the page
  rendered "Data source: google-books, open-library".
- 🚫 CI/CD on GitHub Actions: image builds, auto-deploy to AWS, tag-based rollback — blocked:
  this session has no AWS account/credentials, see "Blockers" below. Building and publishing
  images to GHCR (without auto-deploy to specific infrastructure) was already done in Phase 1.6 —
  a separate, non-blocked item that covers the real need of the project's self-hosting model:
  the user deploys with `docker compose pull && up -d` themselves; AWS auto-deploy is not part of
  that path at all.
- 🚫 Secret management (AWS Secrets Manager / SSM), source-key rotation — blocked by the same
  absence of an AWS account. For the self-hosting model, secrets are already covered by `.env`
  (docs/architecture.md §9) — SSM only becomes relevant if the project ever gets its own
  managed hosting, which it currently does not have.
- ✅ Load test of search and the card, index optimization based on the results — run on
  real Postgres/Redis with a synthetic set of 50,000 work / 150,000 edition / ~67,000
  external_ref (a representative volume for a standalone catalog, not a handful of test
  records). Two real problems were found and fixed (not hypothetical — both confirmed with
  `EXPLAIN ANALYZE` before/after):
  1. **`PgWorkSearchAdapter.search`** built `WHERE similarity(col, query) > threshold` — a
     call to the `similarity()` function, not the `%` operator, so the GIN index `gin_trgm_ops`
     (Phase 1.2) was never used at all: the plan was `Seq Scan`, 157 ms on 50k rows and growing
     linearly with table size. Fixed to `col % query` with `pg_trgm.similarity_threshold`
     set via `SET LOCAL` inside a short transaction (`SET` does not accept a bind parameter,
     and a session-level `SET` without `LOCAL` would leak into the next query of the same pooled
     connection) — the plan became a `Bitmap Index Scan` over both trgm indexes, 41 ms → **~4× faster**.
  2. **`ExternalRefRepository.findSourcesForEntity`** (a new method, task #68) filters
     `external_ref` by `entity_id`, and there was no index on that column at all — `Seq Scan`,
     6.3 ms on ~67k rows, also growing linearly (called on every uncached
     `GetWorkCard`). Added `external_ref_entity_id_idx` (migration `0002_exotic_the_leader.sql`,
     applied on dev and confirmed by a fresh Testcontainers migration run in the
     integration suite) — `Index Scan`, 0.1 ms → **~60× faster**.
     Measurement under load (50 concurrent workers, 8 s, directly through the use-case layer — the
     HTTP layer was deliberately excluded from the measurement because the per-client rate limit
     (Phase 1.4, 60 req/min) specifically blocks exactly this kind of synthetic traffic from a
     single client; that is not what indexes optimize) on the fixed stack: `SearchWorks` —
     p50 0.9 ms / p95 1.1 ms / p99 1.9 ms at ~59,000 rps; `GetWorkCard` (cold, random ids) —
     p50 0.4 ms / p95 28.8 ms / p99 35.7 ms at ~6,300 rps; `GetWorkCard` (warm cache) —
     p50 0.3 ms / p95 0.9 ms at ~133,000 rps. All numbers are orders of magnitude inside the §6
     targets (cold ≤ 2 s, warm ≤ 300 ms) — a large margin even accounting for an
     order-of-magnitude catalog growth.

### Blockers (recorded honestly, not worked around by quietly swapping the scope)

Three Phase 2 plan items are blocked by external constraints, not by a decision to cut scope.
Recorded explicitly, as agreed with the user at the start of Phase 2 (the "skip and document
honestly" option instead of substituting another source/task without warning):

- **WorldCat Search API** — institutional access only; there is no free/trial tier as of 2026
  (verified live by directly requesting the oclc.org page, not from outdated documentation).
  Without an API key there is nothing to implement a `WorldCatProvider` against — the
  `BookMetadataProvider` port itself is already designed for any new source (Open/Closed,
  Phase 1.1), so adding it in the future requires no use-case rewrites when/if access appears.
- **Index Translationum (UNESCO)** — two independent obstacles, both verified live rather than
  assumed: (1) the full database is available only via HTML scraping, by UNESCO's own admission —
  in direct conflict with the project's main invariant (CLAUDE.md: "no scraping"); this is not a
  temporary inconvenience but an architectural dead end for this path; (2) the open API sample of
  the dataset (the only non-scraping part) does not contain the author field in the returned
  records — verified with direct API requests, not documentation — which makes it unusable for
  natural-key matching (`computeWorkNaturalKey`, Phase 1.1 requires title+author) without
  compromising the idempotency the project strictly upholds throughout the rest of the stack.
- **CI/CD on AWS + Secrets Manager/SSM** — this session has no AWS account or credentials;
  building/publishing multi-arch images to GHCR (Phase 1.6) and the fully self-host path via
  `docker compose` already cover the project's distribution model (open-source, self-hosting),
  which is the priority — deployment specifically to AWS is not part of that path.

### Definition of Done

- [ ] At least 3 sources connected, each a separate adapter, use cases unchanged when
      adding them (verified by diff). **Not met**: still 2 (Open Library, Google
      Books) — the third (WorldCat) is blocked, see above. What was actually done within the
      existing sources: Open Library Lending availability (task #67) and source priority
      on field conflicts (task #68) — both expand completeness and correctness within
      the current two sources, not a third source.
- [ ] Re-measuring completeness on the Phase 0 sample: growth in the share of books with ≥ 3 translations; target ≥ 70 %.
      Not performed — the target metric is tied to connecting new sources (WorldCat/Index
      Translationum), which are blocked; re-measuring the same pair of sources would give no
      new signal.
- [ ] A dump import survives the process being killed midway and resumes correctly. Not
      applicable — the only dump-based import in the plan (Index Translationum) is blocked.
- [ ] A push to `main` automatically delivers the change to the environment; rollback rehearsed. Not
      met — blocked by the absence of an AWS environment, see above; the self-host path (Phase 1.6)
      was already verified live separately and does not need this item for its distribution model.

### Phase risks

WorldCat access may be denied or granted with a strict limit. Plan B: Index Translationum +
national library catalogs with open APIs. The phase must not be blocked entirely on
a single source. **It played out literally as described here in advance** (the risk was correctly
anticipated in the original plan, not in hindsight): WorldCat indeed did not grant access, and
Plan B (Index Translationum) also turned out to be blocked for an independent reason (conflict
with the scraping invariant) — the phase was not blocked entirely: work continued and delivered
real value within the existing sources (tasks #67–69).

---

## Phase 3 · Public launch (2–3 weeks)

**Goal:** an open release of the project as open source, ready to accept outside contributors.

### Tasks

- ✅ README: what the project is, a screenshot of the live UI (docs/images/, taken with Playwright
  against the real stack), quick start (already there since Phase 1.6), **an explicit declaration
  of the legal policy** as a dedicated section (I-5) with a link to CONTRIBUTING.
- ✅ Public API documentation — [docs/api.md](api.md): a human-readable description of all
  endpoints with curl examples and real response shapes. The response shapes are verbatim the Zod
  schemas from `packages/contracts` (one schema validates the server and types the client); a
  separate OpenAPI file was deliberately not generated — it would duplicate contracts with no
  consumer, and `@nestjs/swagger` can be added later without API changes.
- ✅ `CONTRIBUTING.md` with an outright ban on PRs integrating shadow libraries (violation =
  closed without discussion), `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1), issue templates
  (bug/feature) and a PR template with an invariants checklist.
- ✅ MIT license (the file existed; the README section filled in); license cleanliness verified
  with `pnpm licenses list --prod`: only MIT/Apache-2.0/BSD/ISC/0BSD/Unlicense/CC-BY-4.0,
  no copyleft dependencies.
- 🚫 Prometheus + Grafana monitoring with alerts — blocked in this session: "dashboards and
  alerts working on real traffic" requires a deployed public instance with traffic,
  which does not exist (self-host model; the project has no managed hosting of its own).
  `/health/live`, `/health/ready` and structured logs with correlationId (Phase 1) — working.
- ✅ `/health` for external checks — exists and verified live; a public status dashboard is part
  of the blocked item above.
- ✅ **Self-host release:** a README section (Phase 1.6), versioned multi-arch images in GHCR
  (CI, Phase 1.6), `CHANGELOG.md` with an explicit **[BREAKING MIGRATION]** marker (none so far —
  all migrations are additive; the compatibility matrix reduces to "any image + `migrate` =
  up-to-date schema").
- ✅ Seeding the popular core: `pnpm db:seed:catalog` — 20 curated books through the regular
  `SyncWorkFromSource` pipeline (LinkPolicy applies as to any data — only metadata and
  legal links; the seed has no special privileges). Idempotent, survives interruption, `--limit=N`
  for a quick check. Verified live: «Война и мир» → 54 editions, 7 legal links.
  Implemented as a script rather than a published SQL dump: a dump would have to be re-issued on
  every schema change, while the script populates any schema version through the domain code.
- 🚫 The N → N+1 upgrade test on CI — blocked by the literal wording: there are no published
  versioned releases yet (v1.0.0 not released), there is nothing to upgrade "from N to N+1" from.
  The infrastructure for it is ready: a separate one-shot `migrate` service, additive migrations,
  and every integration-test run applies the full migration chain from scratch on a clean Postgres.
- ✅ Security audit: commit history scanned (`.env` never committed, no key patterns
  found, `.env.example` contains only placeholders); security headers added to all API
  responses (nosniff, X-Frame-Options DENY, CSP default-src 'none', no-referrer — verified live);
  CORS restricted to `PUBLIC_URL` outside development; rate limit 60/min (Phase 1.4).
  `pnpm audit --prod`: vulnerabilities exist — all in transitive dependencies; fixes require
  major upgrades (NestJS 10→11, Fastify 4→5, Next 14→15+, drizzle-orm 0.36→0.45);
  `pnpm audit --fix` proposed exactly those majors via overrides — rejected as a blind breaking
  upgrade, recorded in the CHANGELOG as a dedicated framework-migration task.
- ✅ De-facto privacy policy: the instance collects no personal data (no accounts,
  analytics, or cookies), `Referrer-Policy: no-referrer` on the API; no affiliate links appeared
  (Phase 2, item skipped) — nothing to disclose.
- 🚫 Opening the repository, the `v1.0.0` release, the announcement — actions of the project
  owner, not the agent: publishing the repository and announcing it are decisions a human makes
  and carries out.

### Live UX testing before release (beyond the plan, by direct request)

The full user journey was walked live on the real stack (`pnpm dev`: web + api + worker +
Postgres + Redis, real requests to Open Library) — searching for a book not in the database →
lazy backfill → card → editions → expanding a legal link. Found and fixed:

1. **The 5s source HTTP-client timeout was killing live requests**: Open Library that day
   responded in ~9s (successfully!), each of the 3 retry attempts died on the timeout — the sync
   failed against a working API. Raised to 25s (covers the 22s maximum observed in Phase 0).
2. **A transient source error blocked query retries until the end of the day**: a failed sync
   "completed" the backfill job with a not_found status, and a completed job with a deterministic
   daily jobId held BullMQ deduplication for 24 hours — a repeated search silently enqueued no new
   job. Fixed from both sides: `ProcessBackfillJob` now throws
   `BackfillSourcesUnavailableError` (the queue retries on its own with backoff), and the queue no
   longer holds completed jobs in deduplication (`removeOnComplete: true`; failed jobs — an hour
   for inspection, history — in `sync_log`).
3. **Search UX**: the polling window extended to ~90s (the first sync of a popular book
   legitimately makes several sequential 9–22s requests), an explanatory message appears after
   ~30s, and the dead-end "refresh the page later" was replaced with a "Try again" button.
4. **Languages as readable words instead of ISO codes** ("German, Spanish…", not "de, es") — via
   `Intl.DisplayNames`, without violating layer boundaries (web does not see domain).
5. **The language filter is a dropdown** of the book's actually available languages instead of a
   text field that required knowing the ISO code by heart.
6. **Source availability visible in the list**: `linkCount` in the editions API (a new port method
   `SourceLinkRepository.countByEditionIds`, one query for the whole list), a "has sources" badge,
   editions with sources first, grouped by language and year descending within. Previously one
   would have had to expand all 30 editions one by one to find where the links are.

Result of the live run after the fixes: «Мастер и Маргарита» — background sync from scratch, 30
editions, 7 languages, 7 real archive.org borrow links with legal status; the filter, mobile
layout (375px, no horizontal scroll), and empty states verified. A known limitation
recorded: the original-language heuristic (based on the earliest edition of the sample) for
«Мастер и Маргарита» yielded "English" — the early Russian editions did not make it into the
source's sample.

### English UI and documentation (by direct request)

The entire UI and all documentation were switched from Russian to English (Russian remains only
where it is literal data: book titles in tests and examples, the `name_ru` column, seed queries
in the books' original languages). The switch itself surfaced and fixed two more real issues,
both verified live:

1. **Cross-language search dead loop**: an English query ("Master and Margarita") could not find
   a work stored under its Cyrillic original title, the backfill "succeeded" by deduplicating
   into that same invisible work, and the UI polled `pending` forever. Fixed by making edition
   titles a search arm of their own (the English edition titles were already in our database),
   backed by a new trigram index on `edition.title` (migration 0003) — covered by an integration
   test against real Postgres and verified live end to end.
2. **Poll-triggered duplicate syncs**: the earlier `removeOnComplete: true` fix overshot — with
   completed jobs vanishing instantly, the UI's 3-second poll loop re-enqueued a real sync on
   every poll (observed live: 11 back-to-back syncs of one work in 40 seconds, one of which
   raced into writing 7 mis-attributed link rows — cleaned up, not reproducible under controlled
   conditions after the fix). Completed jobs are now retained for 60 seconds: long enough for
   jobId dedup to absorb a polling session, short enough that a deliberate retry works.

### Definition of Done

- [ ] An outside developer brings the project up locally by the README with no questions to the
      author (verified on a live human). **Requires a live human** — the agent cannot honestly
      close this item on their behalf; the README path is machine-verified (all its commands were
      executed live in Phases 1.6 and 3).
- [x] No secrets in the repository history — verified: `.env`/`.env.local` were never committed in
      any revision, a scan of the entire history (`git log --all -p`) for key patterns
      (Google API, OpenAI/GitHub tokens, AWS, private keys) found nothing;
      `.env.example` contains only placeholders.
- [ ] Dashboards and alerts working on real traffic — blocked (see the monitoring item
      above: real traffic does not exist without a public instance).
- [x] The legal policy is visible in the README (a dedicated section), `CONTRIBUTING.md` (the main
      rule), and in the UI (a footer on every page + an explicit legal status on every link).

---

## MVP success criteria

| Criterion         | Target value                                               | How we measure                                          |
| ----------------- | ---------------------------------------------------------- | ------------------------------------------------------- |
| Data completeness | ≥ 70 % of requested well-known books find ≥ 3 translations | Run over the Phase 0 sample, report in `docs/research/` |
| Response speed    | cold cache ≤ 2 s, warm ≤ 300 ms                            | p95 from API metrics                                    |
| Freshness         | background sync at least weekly for active records         | Metric of maximum `synced_at` age                       |
| Legal cleanliness | 0 direct download links outside public domain sources      | `LinkPolicy` tests + periodic `source_link` audit       |

---

## Cross-cutting risks

| Risk                                                | Impact                                                 | Mitigation                                                                                               |
| --------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Translator data in open APIs is patchy              | Card value drops                                       | Measure in Phase 0; on a bad result, do not promise the translator as a key feature                      |
| Google Books limits / blocking                      | Search degradation                                     | Adapter cache, conditional requests, our own data as the primary answer source, source isolation         |
| WorldCat access not granted                         | Lower completeness for rare languages                  | Plan B in Phase 2, early application                                                                     |
| Erroneously merging different works into one `work` | Data corruption, hard to roll back                     | Conservative matching, `external_ref` as a source trail, manual sample verification, ability to split    |
| Instability of `normalize()`                        | Idempotency breaks, duplicates grow                    | Table-driven tests, changes only with a natural-key recomputation migration                              |
| Empty database on a fresh self-host installation    | The user deletes the container within the first minute | Lazy backfill ([ADR-0003](adr/0003-lazy-backfill.md)) + seed dump in Phase 3                             |
| Backfill eats up source limits                      | Degradation for all users of the instance              | A separate low-priority queue, collapsing by `jobId`, negative-result caching, a daily job ceiling       |
| Upgrading a self-host instance breaks data          | Loss of trust, unrecoverable losses for users          | Forward-only migrations, a separate `migrate` service, the N → N+1 upgrade test on CI, documented backup |
| A legal claim over a link                           | Existential for the project                            | Invariants in the domain, tests, `unknown` = `copyrighted`, the incident procedure in `legal-policy.md`  |
| Code and layers drifting apart under deadlines      | Architecture erosion                                   | Import-boundary checking in CI since Phase 1.0                                                           |

---

## Phase 4 — the reader's product layer (in progress)

Requested as one batch. Grouped by whether the data behind them exists, because that is what
decides how much of each can honestly be built.

### Done

| #    | Item                                                          | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4.1  | Shops for **every** edition, chosen by the edition's language | Title+author fallback when there is no ISBN (16% of real editions); shops offered by reader's country → the edition's language markets → worldwide                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 4.2  | Genre tags, page counts, binding                              | From Open Library `subjects` / `number_of_pages` / `physical_format`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 4.3  | Edition comparison                                            | Two or three editions side by side, rows where they agree hidden                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 4.15 | The reader's language actually selects books and descriptions | Reported live: with the site in Russian the home page was still a wall of English novels and every blurb was English. Two fixes, both identifier-based rather than guessed — a home-page list from the literature subject for that language (Open Library `/subjects/russian_literature.json`, _Анна Каренина_ and _Преступление и наказание_, not "world classics that also have a Russian edition"), and a description via Wikidata `P648` → that language's Wikipedia, shown with its CC BY-SA attribution. Both degrade to today's behaviour when the source has nothing |

### Buildable, not yet built

| #   | Item                                       | What it needs                                                                                                                                                                                                                                                                             |
| --- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4.4 | Audiobooks                                 | LibriVox has an open, key-free API with per-book download URLs (verified live). A `librivox` provider mirroring `GutenbergProvider`, plus an `audio` link type. Public domain only — no open source lists commercial audiobook availability                                               |
| 4.5 | Accounts + bookmarks                       | Email/password with a `user` + `session` + `bookmark` table; Google OAuth behind `GOOGLE_CLIENT_ID` so a Docker self-host with no key simply does not show the button; welcome email behind `SMTP_URL`, skipped when unset. The soft prompt to sign in belongs on the search results page |
| 4.6 | Homepage bestsellers / "books of the year" | No open API ranks bestsellers. Same shape as `authorized-free-catalog.ts`: a curated, dated list in the repo, extended by PR. Anything else would be inventing a ranking                                                                                                                  |
| 4.7 | Nearby bookshops by geolocation            | OpenStreetMap Overpass answers "bookshops within N km of a point" (verified live, no key). It cannot answer "this shop has this book" — no such open data exists — so the UI must say "bookshops near you", never "in stock"                                                              |
| 4.8 | Global language filter in search           | The card already lists every language a work has; search has no language facet yet                                                                                                                                                                                                        |
| 4.9 | Formal plugin registry + README rewrite    | The ports/adapters split already isolates each source; what is missing is the registry doc and the "why Goodreads is stale and shops mislead you" README                                                                                                                                  |

### Blocked, and why

| #    | Item                   | Blocker                                                                                                                                                                                                                                                                                                                                                                            |
| ---- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4.10 | Prices in shop links   | Google Books `saleInfo` carries a real `listPrice`/`retailPrice`, but only for Google Play and only with a `GOOGLE_BOOKS_API_KEY` (the keyless quota is zero — confirmed live: `RESOURCE_EXHAUSTED`). Every other retailer requires an affiliate agreement with prior sales. So: a Google Play price where a key is configured, and no price anywhere else — never an invented one |
| 4.11 | Price filter in search | Follows 4.10. A filter over a field known for a small minority of editions silently hides everything else, so it can only ship as "only show books with a known price", clearly labeled                                                                                                                                                                                            |

The rule that keeps these honest is unchanged: the app may show what a source actually states, and
must not present a guess as a fact. A shop lookup is a lookup, not a stock check; a nearby shop is
nearby, not known to stock the book; an absent price is absent, not zero; and a description in the
reader's language is one somebody wrote in that language, never a translation this app produced.

---

## Phase 5 — plugin architecture and the reader's own sources (done)

Requested as one brief: an "all-in-one", privacy-first layer on top of the existing catalog —
isolated plugins, OPDS as a first-class way to get files, bookshops near the reader, and prices
compared across shops. The design decisions are in
[ADR-0007](adr/0007-plugin-architecture.md); what follows is what was built and what deliberately
was not.

### Done

| #   | Item                                             | Notes                                                                                                                                                                                      |
| --- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 5.1 | `packages/plugins` — a true leaf package         | Imported by `apps/web` (browser) and `packages/infrastructure` (Node) alike; depends on no workspace package. Enforced in CI (`plugins-is-a-leaf`), `"types": []` keeps Node-only APIs out |
| 5.2 | Plugin contract: manifest, registry, `settleAll` | `accessMode` has no `html-scrape` member — the scraping invariant is expressed in the type system rather than in review comments                                                           |
| 5.3 | Module A — OPDS 1.2 (Atom) and 2.0 (JSON)        | One normalized model behind two parsers; acquisition rels, MIME→format labels, indirect acquisition chains, DRM licences flagged, pagination, OpenSearch. 85 tests on realistic fixtures   |
| 5.4 | Reader-added catalogs                            | Calibre-Web / COPS / Kavita / Audiobookshelf addresses live in `localStorage` and are fetched by the browser — the URL and any password never reach the instance                           |
| 5.5 | Built-in catalog relay                           | `GET /api/opds/feeds/:id` exists only because Gutenberg and Standard Ebooks send no CORS headers. Takes a feed **id**; `href` must be same-origin, so it cannot be used as an open proxy   |
| 5.6 | Module B — `GeoStoreAdapter` + browser lookup    | Coordinates rounded to ~110 m at the source, Overpass queried straight from the browser, manual city/postcode field offered alongside the permission prompt rather than after a refusal    |
| 5.7 | Module C — `AggregateEditionPrices`              | Parallel poll of every registered `PriceProvider`, grouped by normalized binding, 15-minute TTL (60 s when degraded), every offer URL still passed through `LinkPolicy`                    |
| 5.8 | `Money` and `BookFormat` value objects           | Money in minor units with per-currency exponents, never floats and never converted between currencies; bindings normalized across the dozen spellings sources use, in several languages    |

### Found only by running it against the real catalogs

Neither of these was caught by a unit test on a fixture — both needed the live feeds.

1. **Gutenberg's browse and search results are navigation entries, not books.** Each result links
   to that book's own _complete-entry_ document, and the acquisition links exist only there. The
   parser rejected bare `<entry>` roots as "not a feed", so the shelf could reach no download at
   all. Fixed by reading a complete-entry document as a one-entry feed; verified end to end —
   root → All Books → "Pride and Prejudice" → real EPUB and MOBI links.
2. **Standard Ebooks' OPDS feeds are behind a Patrons Circle login.** `/feeds/opds`,
   `/feeds/opds/all`, `/feeds/opds/new-releases` and `/feeds/opds/subjects` all answer `401`
   anonymously; the open `/feeds/atom/new-releases` is a news feed with no acquisition links.
   It was removed from the built-in list rather than shipped as a shelf that always fails — a
   patron can add it through the custom-catalog form with their own credentials.

### Deliberately not done, and why

- **Shop price scrapers.** The brief described the shop adapters as parsers of each shop's
  HTML/DOM. That is the one thing the project's main invariant forbids outright
  ([legal-policy.md](legal-policy.md) I-3), so the plugin contract cannot express it: the shipped
  adapters are one real price API (Google Play via Google Books `saleInfo`, which needs a key) and
  ~90 deterministic ISBN-lookup URLs that are built and never fetched. Most offers therefore carry
  no price, which is stated as "price not published" rather than hidden or invented.
- **Stock in physical shops.** No open dataset maps an ISBN to a shelf. `PhysicalStoreResult`
  carries `availability` and `price` so a bookseller's own stock API can answer them, but the
  shipped OpenStreetMap adapter always returns `unknown` with the reason attached.
- **A local SQLite/IndexedDB mirror of the catalog.** The brief's "core owns a local database"
  applies to a desktop application; this is a self-hosted web service whose catalog already lives
  in its own Postgres, and the reader-specific state that genuinely must stay on the device
  (feeds, country, reading history) is already in `localStorage`. Adding IndexedDB would duplicate
  the catalog with no question it answers better.

---

## Phase 6 — interface redesign (in progress)

One brief: premium not through gold frames but through exact typography, a calm interface and
large, comfortable controls — Apple Books crossed with Stremio, in high contrast, with no
advertising noise. The design decisions are in
[ADR-0008](adr/0008-design-tokens-and-css-modules.md).

Four choices were made before any code, because each one changes the shape of the work: **light and
dark stay equals** (system-driven, no switcher, therefore no new settings popup); **plain CSS with
a token layer and CSS Modules**, not Tailwind and not a `packages/ui` package yet; **typefaces
vendored** into the repository rather than fetched from a CDN; and a **full redesign including page
structure**, not a repaint of the existing 760px column.

| #   | Item                                | State | Notes                                                                                                                                                         |
| --- | ----------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 6.0 | Token layer and vendored typefaces  | ✅    | `styles/tokens.css` (primitives → semantics, both themes), `styles/fonts.css`, Inter + Literata in four subsets, metric-matched fallbacks, `/design` specimen |
| 6.1 | Accent colour chosen on a live page | ✅    | Warm brass. Rights badges moved from filled to outlined-with-a-glyph so a solid colour always means "press me"; borrowing became info-blue rather than amber  |
| 6.2 | UI primitives as CSS Modules        | ✅    | `src/ui/`: Button, Card, Poster, Chip, Badge, Field, Sheet, Skeleton, layout. Logical properties throughout — the wide grid breaks RTL without them           |
| 6.3 | Application shell                   | ✅    | Container 760 → 1240px plus a narrow `--container-prose`; sticky blurred header whose rule fades in on scroll; every target in the chrome now 44px or more    |
| 6.4 | Home page and search results        | ✅    | Hero search at 56px, poster grids in place of lists. The "continue reading" row was **not** built — see below                                                 |
| 6.5 | Work page                           | ✅    | 240×360 cover hero, translation languages as filter chips, editions as cards with an animated disclosure. No sticky action bar — see below                    |
| 6.6 | Remaining pages and motion          | ✅    | Subjects, bookmarks, shelf, sign-in, loading skeletons; one motion vocabulary from the tokens, all of it off under `prefers-reduced-motion`                   |
| 6.7 | Verification                        | 🚧    | Contrast measured in both themes (all pass), RTL checked, tap targets checked, `lint`/`typecheck`/`build` green. Playwright blocked — see below               |
| 6.8 | Dropdowns                           | ✅    | `ui/Select` replaces every native `<select>`: the OS draws a native list and will not take this design's surfaces, type or motion. Unrolls like a scroll      |

### Definition of Done

- Every colour, radius, spacing step, control height, duration and type size in `apps/web` comes
  from a semantic token. `grep -r '--n-\|--indigo-\|--brass-\|--green-' apps/web/src` returns
  nothing outside `tokens.css` and the specimen page.
- The legacy `--color-*` bridge at the end of `tokens.css` is deleted, and nothing references it.
- Text clears 4.5:1 and control edges 3:1 **in both themes**, measured rather than eyeballed.
- Nothing a finger presses is smaller than 44px.
- The Playwright suite passes unchanged: the redesign may move any pixel but may not rename an
  accessible name (`Book title and author`, `Search`, `Show links`) or drop `.skeleton` /
  `.error-box`.
- No third-party request is made by any page. Fonts are served from the instance itself.

### Found while building, and decided rather than assumed

- **The "continue reading" row was dropped.** `lib/reading-history.ts` stores a work id, a title
  and its subjects — no cover and no author. A row of covers built from it would be a row of
  text-only placeholders, and storing cover URLs would change what sits in the reader's browser for
  a decorative gain. The "because you were reading…" section already serves the returning reader,
  and serves them better: it recommends rather than repeats.
- **The work page has no sticky action bar.** Download, buy and borrow are properties of an
  _edition_, not of a work; hoisting them into a work-level bar would mean picking one edition and
  calling it the best, which the data does not support. The bar would have carried "Save" alone.
- **No view transition between the search grid and the work page.** Next 14's client router does
  not wrap navigations in `startViewTransition`, so a shared-element cover transition needs a
  third-party router shim — not worth a dependency for an effect Safari would skip anyway.
- **Native `<select>` had to go.** Its popup is drawn by the operating system — no stylesheet
  reaches inside it, and on Linux it arrived as a grey system menu sharing nothing with the page it
  opened from. `ui/Select` is a `combobox`/`listbox` pair that rebuilds by hand what the native
  element gave for free: arrow keys, Home/End, type-ahead, `aria-activedescendant`, focus returning
  to the trigger, and a closed panel that is inert rather than merely invisible. The real cost is
  the mobile wheel picker on iOS and Android, traded for 44px rows and a scrollable list.

- **Four components still render bare elements.** `OpdsShelf`, `NearbyBookshops`, `EditionPrices`
  and `EditionComparison` use the token-driven `button` / `input` defaults in `globals.css` rather
  than `ui/Button` and `ui/Field`. They look right — the defaults come from the same tokens — but
  they are the remaining work before "every control is the same control" is literally true.

### Blocked

- **The Playwright suite could not be run here.** Its first locator,
  `getByLabel('Book title and author')`, does not match the string the interface actually ships,
  which is `Title and author` (`i18n/dictionaries/en.ts`, key `home.searchLabel`). The mismatch
  predates this phase and fails at `HEAD` too. Seeding also needs `ADMIN_TOKEN`, and this checkout
  has no root `.env`. Every _other_ locator the spec uses was verified against the live pages: the
  `Search` button, the `Translated into` heading, the `Show links` button, the `aria-live` panel
  resolving, and `.skeleton` / `.error-box` both reaching zero.

### Deliberately not in scope

- **A theme switcher.** The system setting already carries the reader's answer; adding a stored
  preference would mean a new settings popup, four outcomes and strings in 15 dictionaries for a
  question nobody asked.
- **CJK and Arabic typefaces.** Vendoring them would add tens of megabytes for four locales whose
  systems ship a good face. Those locales are a documented fallback case, checked visually.

---

## Phase 7 — the blind-client addon engine (in progress)

One brief: the reader installs what they want, the core does not judge what it returns, and nothing
about any of it reaches the instance. The two decisions it rests on are
[ADR-0009](adr/0009-blind-core-link-policy-scope.md) — the link policy governs what this instance
produces, and stops at the addon boundary — and [ADR-0010](adr/0010-addon-engine.md), the engine
itself: one manifest, three resources (`catalog`, `meta`, `source`), two transports behind one
`AddonTransport` interface.

Both transports, rather than one, because each alone loses something real. An HTTP addon cannot
reach the Calibre-Web on `192.168.1.10:8083` that Phase 5 exists to serve; a local JS addon cannot
read a response the target refuses to share with the browser, which is most public APIs.

| #   | Item                                              | State | Notes                                                                                                                                            |
| --- | ------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 7.0 | ADR-0009/0010 and the invariant boundary          | ✅    | `packages/domain`'s policy untouched; its browser-side copy, and the parity test that guarded the duplication, removed                           |
| 7.1 | `packages/addons` — manifest, resources, registry | ✅    | Stremio's shape with `stream` → `source`; zod throughout; HTTP transport; ordered registry; 67 tests                                             |
| 7.2 | HTTP transport wired into an install flow         | ✅    | Two steps: reading the manifest shows who the addon will contact, and nothing is stored until the reader agrees to that                          |
| 7.3 | Sandbox for local JS addons                       | ✅\*  | Four layers built and driven by a 9-test escape suite (`pnpm test:sandbox`). The asterisk is Chromium — see below                                |
| 7.4 | Aggregation across addons                         | ✅    | `settleAddons` with a 12s ceiling behind both surfaces; a failed addon shows its own reason in its own group                                     |
| 7.5 | `/addons` page and the reader-facing surfaces     | ✅    | Both transports install through one two-step flow and one consent card; reorder, enable, remove; sources on the work page, catalogs under search |
| 7.6 | Zero-knowledge enforcement                        | ✅\*  | Boundary rules, plus three Playwright tests that watch the wire while an addon is installed and used. Same Chromium caveat as 7.3                |
| 7.7 | Protocol spec, example addon, validator           | ✅    | [addon-protocol.md](addon-protocol.md), `examples/addon-template`, `pnpm addon:validate`. No npm SDK — see below                                 |
| 7.8 | Fold the custom-OPDS-feed form into the engine    | ✅\*  | One list, one removal path, credentials intact. The asterisk is navigation, which stayed in the shelf — see below                                |

### Found by running 11.3 in a browser, not by writing it

Four things, none of which any amount of design review had produced, and each cheap only because a
real book was opened on the real route:

- **A static CSP could not have worked at all.** Next injects its own inline scripts for hydration,
  so `script-src 'self'` without a nonce refuses the framework along with the book. The policy is
  therefore built per request in `middleware.ts`, scoped to `/read` — and scoped deliberately, so
  that nobody tunes it later while thinking about analytics.
- **Development needs a different shape, and only one.** `'strict-dynamic'` disables host-based
  allowlisting, and Next's dev-only fallback chunks carry no nonce — with it, a dev page is a wall
  of refusals. Dev drops `'strict-dynamic'` and adds `'unsafe-eval'`; neither shape contains
  `'unsafe-inline'` or `blob:`, so the hostile fixture is testing the real wall either way.
- **Dropping `pdf.js` from the vendored tree was not enough.** `view.js` reaches it through a
  dynamic import, which a bundler resolves whether or not a PDF is ever opened — Next refused to
  build the reader at all. The branch is now patched out, which says what deleting the files meant
  to say in the one place that is also true at build time.
- **`open()` renders nothing.** Upstream's own reader calls `renderer.next()` afterwards; without
  an equivalent the view sits there, correctly loaded and entirely blank, which is a hard thing to
  read backwards from. It is now `renderFirstPage()`, named and commented, and it is where resuming
  a stored position will go in 11.5.

Two more that would have shipped silently. The engine probe **answered `false` in Chromium** the
first time it ran, because it settled on the frame's initial `about:blank` instead of polling for
its document — quietly dropping every reader to one wall, which is exactly the failure mode ADR-0013
warns about. And `hidden={state !== 'open'}` rendered as `hidden="false"` on the custom element,
because React stringifies props there and HTML's `hidden` hides on presence.

### What 11.4 settled about getting a book in

- **The handoff carries the address in `sessionStorage` or the URL fragment, never a query string.**
  Both are invisible to the server; a query string would be in the access log before any of this
  code ran. The fragment form exists for a pasted link and is erased with `replaceState` on arrival,
  so the address does not outlive the moment it was useful.
- **The dead end has no "try through this site" button, and the test asserts its absence.** A source
  that refuses the browser gets an explanation, a download link, and the suggestion to open the file
  from the device. The only thing a retry button could do is call a route this project does not have.
- **The message still does not say "CORS".** It cannot: a refused cross-origin read and an
  unreachable host arrive at `fetch` as the same opaque `TypeError`. That is not a limitation to
  route around — the reader's next step is identical either way.
- **A record per book, bytes only on request.** Opening a book writes a few hundred bytes so the
  reader can find it again; keeping the file is a separate switch, off by default, and the checkbox
  follows what IndexedDB _did_ rather than what was clicked. On a browser that refuses the write it
  never moves, and the popup says the browser refused rather than claiming success.
- **Two object stores rather than one.** Listing the library must not deserialize a 40 MB EPUB per
  row, which one store would.

Two things the tests learned the hard way. Playwright's `route.fulfill` **skips the CORS check**, so
a "refused" response arrived intact and the dead-end test passed the book through instead — the
faithful simulation is `route.abort()`, for the same reason the message does not name CORS. And
`check()` on the keep-file checkbox fails: it is controlled by what storage did, not by the click,
so it flips a few milliseconds later — which is exactly the property that makes a refused write
visible.

### What 11.5 settled about remembering

- **One record, after briefly being two.** 11.2 wrote `ReadingRecord` before there was anywhere to
  put it and 11.4 wrote `LibraryEntry` when the storage arrived — two shapes for one thing,
  overlapping in four fields. They are one type again, and the bytes stay in their own store because
  a list must not deserialize a 40 MB EPUB per row.
- **Only a refused write says anything.** A position that stored correctly is not news: nobody asked
  for it and there is nothing to confirm. A position that did _not_ store is a book that opens at
  page one tomorrow, so that one gets a popup — once per book rather than once per page turn, since
  the reason does not change and a popup on every turn is wallpaper.
- **A stored locator is tried and not trusted.** `renderFirstPage` falls back to the beginning if a
  CFI no longer resolves. Landing on page one is a small disappointment; an exception there would
  mean the book does not open at all.
- **Notes save on blur, not on keystroke.** Each save is a write and a popup.

Three things found by running it. Reading a record written by the **previous build** threw on
`position.cfi` for every book already in the library — storage outlives deployments, so
`reviveEntry` now upgrades an older shape instead of dropping somebody's shelf (the trade 7.8
already refused once). `goTo` at open time emits no `relocate`, so after resuming, "bookmark this
page" stayed disabled until the reader turned one — the current position is now seeded from the
record. And the button read a ref, which cannot re-render anything; the locator is held twice on
purpose, once for the listener and once for the button.

**Highlights over selected text are not in this phase, and the reason is 11.1b.** A highlight needs
to know what the reader selected, which needs `selectionchange` inside the book's frame — and that
is the frame WebKit delivers no events to. Building it would mean a feature that works in two engines
and silently does nothing in Safari, or moving selection handling somewhere it does not belong. A
bookmark with a note does what most of the need is, works everywhere, and does not pretend.

### What 11.6 settled about how a book looks

- **`packages/reader` decides no colour.** It takes a palette and writes CSS text into the book's
  own document — a document `tokens.css` can never reach. The four palettes live in `tokens.css`
  with the rest of the project's colours (ADR-0008), the host resolves them, and a test asserts the
  package emits no hex value it was not given.
- **`app` is not a fifth palette.** It means "whatever `--surface-1` and `--text` are right now", so
  it follows the site's light/dark switch with no second set of values to keep in step.
- **E-Ink is not dark mode inverted.** Pure `#000` on `#fff` — an e-paper panel has no greys worth
  trusting — plus one column, no transition, no shadow, no gradient, and images desaturated. It is
  the only theme that removes motion unconditionally: elsewhere that stays inside
  `prefers-reduced-motion`, because there the reader's system has already answered.
- **Every control is discrete.** Steps and choices, no sliders: each change announces itself, and a
  slider means either a popup per pixel or a rule about when a drag has "finished". Values show as
  numbers — 130%, 1.5, 6% — so the interface does not invent a word for every step and translate it
  fifteen times.
- **A refused write still applies on screen.** Refusing to show the reader what they just chose,
  because the browser will not remember it for next time, would be a second and worse failure. The
  popup says it will not last; the page does what was asked.

Two found by looking at it. The type-size stepper is three controls in one grid cell, and at
`minmax(11rem)` its last button overlapped the next column — invisible until a real book was on
screen behind it. And the two new toggles broke four older tests that asked for "the checkbox";
they now name the one they mean, which they should have done from the start.

### 11.7 met the real catalogue, and the catalogue had opinions

The button is offered where a row has a file whose format this reader opens: a `download` link on
the work page, and an addon source that is not flagged `externalPage`. Nowhere else. The free shelf
has no button because it has no file — its cards carry a "downloadable" badge and link to the work
page, where the URLs actually are, and adding one would mean a request per card for data the free
shelf's contract does not carry.

Then it was pointed at this instance's own database, and three things came out of that:

- **`readableFormatOf` has to be conservative, and the data says why.** The `format` column here
  holds `epub` (468 links) and `mobi` (96) — and also `abbyy gz`, `animated gif`,
  `archive bittorrent`, `64kbps mp3` and `additional text pdf`. It is a guess about whether to show
  a button, never about how to parse a file; the bytes decide that later, in `sniffFormat`.
- **Most download links here have no format at all** (422 of them), and most are Internet Archive
  `/stream/…` addresses, which are reading pages rather than files. No format, no button — which is
  the right answer twice over.
- **The CORS dead end is the common case for the big sources.** Measured with `Origin:` set:
  `standardebooks.org` answers `Access-Control-Allow-Origin: *`; `gutenberg.org` and `archive.org`
  send no such header at all. So on this catalogue the direct fetch usually ends at the honest dead
  end, and the file picker carries the feature — exactly the risk this phase wrote down in advance,
  now with numbers instead of a guess.

**And a fourth thing, which was a bug.** Following the button to a real Standard Ebooks URL got
`200 OK` with `text/html` — a landing page or an anti-bot check, not the EPUB — and the reader
answered "this file is not a book this reader can open". True, and useless: the reader did not
choose a broken file, they were handed a page. `not-a-file` is now its own outcome with its own
sentence and the same fork in the road: open the page yourself, the file is behind it.

### Decided rather than assumed

- **No `rightsStatus` on an addon result, and no field to hold one.** The instance's own links carry
  one because it knows where they came from. An addon's does not, and a guess rendered as metadata
  reads as a fact. Zod strips the key if an addon sends it, and a test asserts that.
- **Scheme validation stays, and is not a revived denylist.** `javascript:`, `data:`, `blob:` and
  `file:` are refused for every URL an addon produces, because each one executes or reads in _this_
  origin. `https://any-host-at-all` passes, and a test says so out loud.
- **A local addon's declared hosts are a security boundary, not a content one.** Any host may be
  declared, including ones the domain policy refuses for the instance. The list exists so the reader
  can decline before installing, and so an addon cannot quietly move their reading somewhere else
  afterwards. Wildcards are refused: a permission the reader cannot evaluate is not consent.
- **`settleAddons` duplicates `settleAll` rather than importing it.** Both packages are leaves, and
  twenty lines of `Promise.all` is cheaper than making either one stop being one.
- **The sandbox CSP hash is computed, not written down.** `next.config.mjs` reads
  `public/addon-sandbox.html` and hashes its inline bootstrap at build time. A hash written down is a
  hash that goes stale, and a stale one fails closed in a way nobody connects to the edit that caused
  it.
- **Enforcement is a host function, with the CSP behind it rather than in front.** A per-addon
  `connect-src` would have to be generated by the server, and asking the server for it would tell the
  server which addons the reader installed. So `connect-src 'none'` is static, `mediatedFetch` does
  the allowlisting where a unit test can reach it, and the CSP is what makes it unavoidable.

### What the escape suite actually proves, and where it stops

Nine tests in `apps/web/e2e/addon-sandbox.spec.ts`, run against the real document and its real
header: the sandbox document sits on an opaque origin (`window.origin === 'null'`, storage and
IndexedDB throw, the parent's DOM is unreachable); a `fetch` from inside it is refused **to an
address that is definitely reachable**, so the refusal is the policy and not the network; the worker
has no `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `importScripts`, `document`, `window`
or `parent`; an undeclared host is refused with no request made at all; a declared host is reached
without the instance's cookie; and a `while (true)` addon loses its own call while the page keeps
answering.

### There is no published SDK, and the spec is the deliverable instead

An `@golden/addon-sdk` package would be a builder function and a type re-export that nobody outside
this repository could install, since nothing here is published to npm. What an author actually needs
is a document that is complete enough to write against without reading our source, a file they can
copy, and a way to check their work — so 7.7 shipped those three and skipped the fourth. If the
protocol ever reaches a second implementation, a published package becomes worth its maintenance;
today it would be a package whose only user is the example next to it.

### 7.8 folded the storage, not the browsing, and the difference is the protocol's

A reader's OPDS catalog is an addon by every definition in ADR-0010 — they added it, their browser
fetches it, this instance never sees it — so it is now stored as one: a `builtin: 'opds'` descriptor
in `btf.addons`, migrated from the old `btf.opds-feeds` key the first time anything reads the list.
One list, one place to remove a catalog from, and the `/addons` page finally shows everything the
reader has added rather than half of it. If the write is refused the old key is left exactly where it
was and the migration retries; losing somebody's shelf to a full quota would be a poor trade for a
tidier schema.

**Browsing did not move, and could not have.** An OPDS catalog is a tree — Project Gutenberg's root
is nothing but links to other feeds, which Phase 5 found the hard way — and the addon protocol has no
notion of navigation: a `catalog` is a flat list with an offset. Folding the shelf into it would have
meant either losing the ability to walk into a sub-catalog, or extending the protocol with a
tree concept for the sake of one built-in. So `OpdsShelf` keeps the browsing it was built for, and
`OpdsAddonTransport` answers the two questions the protocol _can_ ask: what is in this feed, and do
you have this ISBN. The second is new — a reader's own Calibre can now show up as a source on a work
page.

It lives in `apps/web` rather than `packages/addons` because the OPDS parsers are in
`@golden/plugins`, both packages are leaves, and neither may import the other. `apps/web` is the one
place they can meet; duplicating 85 tests' worth of parser to avoid that would have been the worse
trade.

### What "zero knowledge" is now held to

`pnpm test:sandbox` carries three tests that install an addon through the page, use the site with it,
and then read back every request the browser made. Any request that did not go to the addon's own
origin must contain none of its id, its manifest URL or its host — in the URL, in a header, or in a
body. One of them repeats the exercise with the addon failing, because a failure is exactly where an
error-reporting call would quietly undo the property.

What is deliberately **not** treated as a leak: the reader's search term reaching this instance's own
`/api/search`. They typed it into this site's own search box, and calling that a disclosure would
make the test either meaningless or unpassable. What must not travel is the addon.

### The integrity hash is required, and the form does not offer to compute it

A local addon's install form asks for `sha256-…` and refuses without it. It would be friendlier to
hash whatever was downloaded and show that — and it would also be worthless, because approving the
hash of the file you just fetched is approving whatever happens to be there. The hash comes from the
author or the install does not happen. When it does not match, the message names the two things that
could have caused it and stops; it does not print the hash it computed, because a printed hash is an
invitation to paste it into the box.

### Found only by driving a real addon in a real browser

Neither of these was caught by 120 unit tests, and both were fatal to the feature. A throwaway
Stremio-shaped addon on `localhost:4200` found them in about a minute.

1. **`globalThis.fetch` was being called unbound.** In a browser `fetch` is a method of `Window` and
   throws `TypeError: Illegal invocation` with any other receiver; Node's does not care. So
   `const f = globalThis.fetch; f(url)` typechecked, passed every test, and failed on every install —
   surfacing as the CORS message, which sent the diagnosis in exactly the wrong direction. Fixed by
   `ambientFetch()`, and `transport.test.ts` now models the browser's rule so Node stops hiding it.
2. **`idPrefixes` was being tested against catalog ids.** It describes the ids of _books_, so an
   addon declaring `['isbn']` and a catalog called `all` was never asked for its catalog at all —
   the search surface showed "does not offer catalog for book" for a perfectly good addon. The rule
   now lives in `addonSupports`, where a catalog is exempt, with a test naming the regression.

The zero-knowledge property was checked the same way rather than argued: with an addon installed, a
search and a work page produced requests to the addon's own origin and to nothing else. The
instance's own origin and its API never saw the addon's id, its manifest URL, or the query sent to
it. That observation is not a test, which is why 7.6 is still amber.

**It stops at Chromium.** That is the only browser binary installed here, and the three properties
the suite turns on — CSP enforcement, opaque-origin semantics, and whether a `Worker` may be created
from a `blob:` inside a sandboxed frame — are exactly the ones engines have historically differed
on. Chromium creates that worker; Firefox and WebKit are unverified and the sandbox is not finished
until they are run. A green tick above is evidence for one engine, not three.

---

## Phase 8 — why a search took two minutes, and why covers did not arrive

Reported by the reader in the plainest possible terms: "many books simply cannot be found and take
two hours to search, and the covers themselves take half a year to load". Measured against the live
dev instance rather than reasoned about — a cold search for _Solaris_ was still answering `pending`
after 118 seconds, and a nonsense query never resolved at all. Five separate causes, each of which
alone was enough to produce the complaint.

### Found by measuring, not by reading

1. **LibriVox now answers "no recording" with HTTP 404**, where it used to answer 200 with
   `{"error": …}` in the body. The provider read any non-OK status as an outage and threw. LibriVox
   is in the backfill's _discovery_ list, so this fired on nearly every query — most books have no
   volunteer recording. One throw made `ProcessBackfillJob` report `BackfillSourcesUnavailableError`,
   which skipped the 24h negative cache and handed the job back to the queue's retry-with-backoff.
   The result the reader saw: a book nobody has ever recorded stayed `pending` until the poll gave
   up, every single time, forever. Fixed in the provider — 404 is an empty catalogue, 503 is still
   an outage, and a test pins the distinction.

2. **A reader's own search queued behind bulk work nobody was waiting for.** A genre page with a
   thin local result queues twenty books at once, the home page queues its misses, and all of it
   went into the same `backfill` queue at the same priority, two at a time. The measured queue at
   the time of the report: two active jobs and six waiting, all of them genre fills — with the
   reader's `Solaris` third in line. `JobQueuePort.enqueue` now takes a priority, and the split is
   `interactive` (somebody is watching a spinner) versus `deferred` (the page has already rendered
   without it). BullMQ empties its plain `wait` list before it looks at `prioritized` at all, so
   marking the bulk work is what makes it yield; the reader's search is left unprioritized.

3. **A keyless Google Books poisoned every genuine "not found".** It answers 429 to everything once
   the anonymous quota is gone, which on a self-hosted instance is always. Under the rule "any
   source errored ⇒ throw and retry", that single permanently-unhappy source meant no missing book
   could ever be recorded as missing. `ProcessBackfillJob` now takes `lastAttempt` from the queue
   consumer: while retries remain it still throws, and on the last one it records a **degraded**
   not_found kept for fifteen minutes instead of a day. A nonsense query went from never resolving
   to `not_found` in 58s.

4. **A failed job made its query un-askable for an hour.** Failed jobs were retained for an hour as
   a dead letter, and BullMQ's dedup counts retained jobs — so every re-enqueue of that query was
   swallowed, `GET /api/search` answered `pending` against a job that would never run again, and the
   "Try again" button restarted the same doomed poll. Retention cut to five minutes; the durable
   record was always `sync_log` in Postgres, not Redis.

5. **The work page rendered every edition a work has**, and 964 of _Dracula_'s 980 had no cover of
   their own, so each one carried a cover URL derived from its ISBN. The list now opens at 24
   editions with a "show more" link, and only what is on screen is handed to the comparison table
   (a client component, so every edition given to it is serialized into the page a second time).
   Measured on the same page: 980 cards → 24, and the covers requested with them 980 → 23.

6. **The ISBN-derived cover was a guess that never came true.** `coverUrlFromIsbn` existed on the
   theory that Open Library resolves a cover for any ISBN independently of the edition record —
   originally checked against three ISBNs, two of which worked. Re-measured against the editions
   that actually rely on it: **35 of 35 returned 404**, sampled across two works with 964 and 936
   coverless editions. The tell is the control group — ISBNs belonging to editions that _did_ carry
   a cover resolved 200 or 302. The endpoint finds a cover exactly when the record already has one,
   which is exactly when the fallback is not needed. So it produced no images, cost about a second
   of Open Library round trip per coverless edition, and spent a share of the 100-per-5-minutes
   budget Open Library allows for ISBN-keyed cover lookups — the same budget the covers that _do_
   work draw on, which is how one work page could leave the whole site coverless for five minutes.
   That is the "half a year" the report describes. Removed, along with the policy function.
   On the work card it was also actively harmful: `firstEditionCover` took the first edition with
   an ISBN, so the 404 beat a real cover sitting on a later edition.

Alongside those, two latency fixes inside one sync, both pure sequencing: `fetchEditions` and
`fetchWorkDetails` now run together, as do the availability batches and the work's `ia` lookup,
which no source ordering ever required. Measured A/B on three works: 3.3s → 2.3s, 42.4s → 4.0s,
7.8s → 8.6s (noise) — the large win is on works whose availability spans several batches. The `ia`
list is capped at 100 alongside the existing edition-key cap, which is what bounds that fan-out to
four concurrent requests.

### Then a reader searched in Russian, and it was worse than that

7. **The source was being asked the question in the script it answers worst.** The project already
   had `romanizeCyrillicQuery` — and used it only when searching its _own_ Postgres, never when
   asking Open Library. Measured live against Open Library's search: «Анна Каренина» 2 results vs
   "Anna Karenina" 331; «Преступление и наказание» 6, topped by a German edition, vs
   "Prestuplenie i nakazanie" 136 topped by the Russian one; **«Санькя Прилепин» 0 vs "Sankya
   Prilepin" 2**. That last one is the whole bug: zero results means the sync reports `not_found`,
   nothing is ever written, and the reader polls a book the source plainly has until the page gives
   up. The romanizer moved to `packages/domain` (it is a pure function with no dependencies) and
   `SyncWorkFromSource` now asks a second time in Latin when the first question finds nothing.
   «Санькя Прилепин» went from unfindable to found in 6s.

8. **The answer depended on the search re-finding, by text, the row it had just written.** A poll
   could only be satisfied by the trigram search matching the reader's words against the stored
   work — but the sync stores whatever the source calls the book, which for a Russian query is
   routinely a romanized or English title. `searchResultsCacheKey`'s comment claimed the backfill
   consumer wrote the results the search reads; nothing ever did. Now `SyncWorkFromSource` carries
   the work it resolved out of the transaction, and `ProcessBackfillJob` records it under the
   query — consulted _after_ the database search, so a query the search can answer keeps its full
   ranked answer and only a query it cannot gets rescued.

   Honest scope: on both live queries tried, the existing romanized fallback in
   `PgWorkSearchAdapter` turned out to match anyway, so the memo was not what rescued them — Fix 7
   was. What it removes is the _dependency on that coincidence_, which is otherwise a matter of
   whether some edition happens to carry a Cyrillic title.

### Verified live, on the running instance

| Query                            | Before                            | After              |
| -------------------------------- | --------------------------------- | ------------------ |
| `Neuromancer William Gibson`     | —                                 | `found` in 7s      |
| `Moby Dick Herman Melville`      | —                                 | `found` in 15s     |
| `Kindred Octavia Butler`         | —                                 | `found` in 16s     |
| `Solaris Stanislaw Lem`          | `pending` @118s                   | (same code path)   |
| «Санькя Прилепин»                | 0 results at the source, unusable | `found` in 6s      |
| «Пикник на обочине Стругацкие»   | —                                 | `found` in 6s      |
| «Двенадцать стульев Ильф Петров» | —                                 | `found` in 15s     |
| «Моим легионерам»                | spun to the 90s cap, then red box | `not_found` in 24s |
| a nonsense query                 | never resolved                    | `not_found` in 58s |

«Моим легионерам» is the honest one: Open Library returns nothing for it in either script, and
Google Books cannot be asked on this instance (no key, anonymous quota spent). No source here has
that book, and the reader is now told so in 24 seconds instead of watching a spinner for ninety.

### Not done, and why

- **The per-edition write loop.** One sync of a heavily reprinted work does five or six sequential
  Postgres round trips per edition inside a single transaction, up to a thousand editions. It did
  not dominate any measurement taken here — the HTTP path did — so it stays a known cost rather
  than a guessed-at fix.
- **A cover proxy on this instance.** It would fix the ISBN rate limit properly (our server pays it
  once and caches), but it puts image bandwidth on a self-hosted box, and bounding the page removed
  the symptom. Worth revisiting if covers are still thin after that.
- **The degraded `not_found` still reads as "Nothing found. Try refining the title or author."**
  The honest sentence would say a source was unreachable, and `GET /api/search` has no state for
  that. A fourth response state is a contract change, not a wording change.

---

## Phase 9 — three more sources, and the four bugs that were hiding behind "not found"

Reported as "a pile of books simply cannot be found, and that is a catastrophe". Candidate sources
were measured before any was written, against seven books this instance could not find under any
spelling (Prilepin's «Обитель» and «Моим легионерам», Zhadan's «Інтернат», Vodolazkin's «Лавр»,
林奕含's 房思琪的初戀樂園, Glukhovsky's «Метро 2033», 村上春樹's 帰り道):

| Source           | Found | What it contributes                                 | Key |
| ---------------- | ----- | --------------------------------------------------- | --- |
| Open Library     | 1 / 7 | editions, languages, Internet Archive links         | no  |
| **Wikidata**     | 7 / 7 | identity: author, original language, year, genre    | no  |
| **BnF**          | —     | French editions **with the translator named**       | no  |
| **DNB**          | —     | German editions, likewise                           | no  |
| Internet Archive | 2 / 7 | and both were the wrong book — public domain scans  | no  |
| Google Books     | —     | untestable here: the anonymous daily quota is spent | yes |

All three were added. Wikidata is a discovery source of **last** resort — it knows a book exists
and almost never knows its editions (_War and Peace_ has 15, «Мастер и Маргарита» none) — so it
must not outrank a source that can describe what a reader could actually hold. The two national
libraries are the opposite and are registered as **enrichment**, never discovery: their records are
translations, so discovering «Обитель» through the BnF would file the book as "L'archipel des
Solovki" with French as its original language.

### What had to change for enrichment to work at all

- **`attachToWorkId`.** An enrichment source could previously only contribute to the discovered
  work by reproducing its natural key — spelling the title and author identically. That is true of
  Project Gutenberg and false of any translation catalogue, which would instead have quietly
  created a second, half-empty book. Discovery now tells the source which work it is enriching.
- **Enrichment asks in the book's words, not the reader's.** «Лавр Водолазкин» reached a German
  catalogue that files the novel as "Laurus" by "Vodolazkin, Evgenij Germanovič" and knows nothing
  by either of those words. Discovery has just established what the book is called; carrying the
  raw query forward wasted that.
- **The original language falls back to what the source declares.** Wikidata states `P407` as a
  fact and lists no editions, and the edition-based heuristic would have printed "English" on the
  card of a Romanian memoir.
- **The sources that said no are asked again, once the book has a canonical name.** Reported as
  "books are found now, but there is no information on them — nowhere to download and nowhere to
  buy", against _For My Legionaries_: a card with no editions, no translations and no shops. The
  cause was not missing data anywhere. Open Library **has** that book, with editions — under its
  English title, which is a string nobody had ever asked it about, because discovery asked
  «Моим легионерам» and «Moim legioneram» and stopped. Wikidata then named the book, and that name
  went only to the enrichment sources. Now any discovery source that drew a blank is re-asked with
  the canonical title and author, but only when that name actually differs from what the reader
  typed — re-running every source on a query that already worked doubles an ordinary search and
  can buy nothing. The card went from 0 editions to 2, with publisher, year, page count and an
  ISBN, which is what the bookshop deep links are built from: eight shops, verified in the browser.
- **The catalogues no longer guess.** With no record by anyone the query names, the SRU providers
  fell back to the most common author among the records — and attached a French monograph _about_
  the Iron Guard to Codreanu's own memoir as an edition of it. They only ever run against a book
  another source has identified, so "no record is by this person" is a complete answer.

### Three relevance bugs the new coverage exposed

1. **One shared word in an unrelated edition title was enough.** «Обитель Прилепин» returned _La
   chartreuse de Parme_ by Stendhal, because its Russian edition is «Пармская обитель» and that
   scored 0.360 against the query — over the general 0.3 bar — while the work itself scored 0.000.
   Reaching a work through an edition title now carries a higher bar (0.5); the matches that arm
   exists for score 1.000 and 0.621.
2. **Matching both the title and the author counted for nothing.** The rank took the maximum of
   the separate arms, so for "Shantaram Gregory David Roberts" the author's name scored 0.459 for
   _every_ book by him — _Shantaram_ and _The Mountain Shadow_ tied, and the order between them
   was arbitrary. On the title-and-author text together they score 0.730 and 0.396.
3. **Any hit at all stopped this instance from looking further.** So a reader searching «Шантарам»
   got a different novel by the same author _and Shantaram was never fetched_ — not on that search
   nor on any later one. `WorkSearchHit` now carries the rank, and a best match under 0.55 is shown
   **and** queued for backfill, which is ADR-0003's own "serve what we have, refresh behind it".

### Verified live, end to end

- «Моим легионерам» — never resolved before, now synced from Wikidata with Romanian as its
  original language and 1936 as its year.
- «Санькя Прилепин», «Лавр Водолазкин», «Інтернат Жадан» — found in 6–16s.
- «Шантарам Грегори Дэвид Робертс» — first search returned the wrong novel and queued the right
  one; the book now ranks first and carries **6 French editions (6 with a named translator) and 8
  German (7 with one)**, from the BnF and the DNB. No previously wired source had any of them.

### Found by running it, and fixed

- The DNB lists _Laurus_ twice for 2016, from "Dörlemann" and "Dörlemann eBook". Keying editions by
  title, language and year alone gave them one id and two natural keys, and the whole enrichment
  died on `duplicate key value violates unique constraint "edition_pkey"`.
- `wikibase:label` falls back to the entity id for an unlabelled item, so `"Q126735031"` went into
  the database as an edition title and onto a page as the name of a book.

### Covers: nothing was broken, everything was slow

Reported as "most books' covers don't load". Measured before touching anything, and the data was
fine — 240 of 344 works had a cover URL, the API returned one for 65 of 66 featured books, and in
the browser **0 images failed**. What was wrong was the cost of each one:

```
covers.openlibrary.org/b/id/8443266-L.jpg
  → 302 archive.org/download/l_covers_0008/…zip/…-L.jpg
  → 302 ia902809.us.archive.org/view_archive.php?…
  → 200  46 923 bytes        redirects=2  ttfb=2.44s  total=2.65s
```

Two redirects onto a _third_ host, so every cover costs a DNS lookup, a TLS handshake and a fresh
round trip. Twenty covers, six at a time: **8.3 seconds**. Nothing fails; a grid simply fills in
one cover every couple of seconds, which is what "the covers don't load" looks like.

So this instance now serves them itself — `GET /api/covers?src=`, a use case over an `ImageFetchPort`
with the bytes cached in Redis for a month, `Cache-Control: immutable` on the way out, and `Poster`
(the one component every cover on the site passes through) pointing at it. Measured after:

|                 | before                             | after                                       |
| --------------- | ---------------------------------- | ------------------------------------------- |
| one cover, cold | 2.65s                              | 2.92s (the same fetch, once, on the server) |
| one cover, warm | 2.65s **every reader, every time** | **0.003s**                                  |
| twenty covers   | 8.3s                               | **0.024s**                                  |

It also takes this instance's readers out of Open Library's per-IP cover rate limit, which one
work page used to exhaust on its own.

**It is an endpoint that fetches a URL it was given, so the host allowlist is the whole safety
story** (`packages/domain/src/policy/cover-hosts.ts`, the same shape as `LinkPolicy`'s). `https`
only, hosts matched exactly rather than by suffix, and **every redirect hop re-checked** — an
allowlist enforced only on the first hop is not an allowlist, and this chain deliberately leaves
the host that was checked. Verified live: `169.254.169.254`, `localhost:3001`, `evil.example.com`
and `covers.openlibrary.org.evil.com` all answer 404 without a request being made.

### Still open

- **Google Books contributes nothing on this instance** and answers 429 to everything. The
  provider has been written since Phase 1; it needs a free API key in `.env`, which is a
  five-minute task in the Google Cloud Console and cannot be done from here.
- **The relay serves the source's bytes unchanged**, at whatever size the URL asks for — `-L` is
  what gets stored, and a 150px grid cell downloads a 500px jacket. Resizing needs an image
  library in the API image and is a separate decision; caching removed the symptom that made it
  worth arguing about.
- **Wikidata-only books have no editions**, so their card shows the book and nothing to hold. That
  is honest, and the catalogues fill it in whenever they have the book.

---

## Phase 11 — the reader that never uploads a book (planned)

_The number is 11 because it was asked for; there is no Phase 10 in this document, and the gap is
left rather than papered over._

A reader who has just been shown a legal free copy has to leave the site to read it. This phase
gives them a reader in the tab they are already in, built on
[foliate-js](https://github.com/johnfactotum/foliate-js) (MIT, vendored, no build step of its own),
and it gives it to them **without this instance learning that they opened anything**.

That last clause is the whole phase. It is not a privacy feature bolted onto a reader; it is the
constraint that decides the architecture, and it is the same constraint as ADR-0010 §6 applied to a
different object. There the thing the server must not learn was _which addons the reader installed_.
Here it is _which file the reader opened, from where, and how far they got_. The mechanisms
therefore rhyme deliberately: a leaf package, code the server cannot import, storage that lives in
the browser, and `pnpm boundaries` making "the server does not do this" a build failure rather than
a promise. They stop rhyming at the sandbox, and 11.1 is where that was found out — see below.

**What this phase does not touch:** `packages/domain`'s `LinkPolicy`, the `/api` surface, the
database, or the addon protocol. If a diff in this phase changes a file under `apps/api`,
`apps/worker`, `packages/domain`, `packages/application` or `packages/infrastructure`, the design
went wrong somewhere upstream of the diff.

### The invariant, stated so it can be tested

> The bytes of a book, the URL they came from, any hash or identifier derived from them, and the
> reader's position in them **never reach this instance's origin** — not in a path, not in a query
> string, not in a header, not in a body, and not in a request that merely fails.

Two consequences that are easy to get wrong and are therefore written down now:

- **No proxy, in any disguise.** Not `GET /api/fetch?url=`, not "just for CORS", not "only for
  allowlisted hosts". `/api/covers` exists and is the closest thing to a counter-example, which is
  exactly why it is worth naming: it fetches an _image_ the instance itself put in its own database,
  under a host allowlist it owns (Phase 8). A book file is chosen by the reader, and a route that
  fetches what the reader points it at is a different animal wearing the same coat.
- **No query parameter, either.** `/read?src=https://…` would hand the book's URL to this instance
  in the request line of a normal navigation, and Next.js would see it before a line of our code
  ran. The handoff is the URL **fragment** (never sent to a server) or `sessionStorage`, and a test
  asserts the request line is clean.

### Tasks

| #    | Item                                                                             | State | Notes                                                                                                                                                       |
| ---- | -------------------------------------------------------------------------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 11.0 | [ADR-0013](adr/0013-client-side-reader.md) — the reader, and the book's own code | ✅    | Carries 11.1's answer rather than the design that lost: same-origin route, two walls, the spike as its evidence base                                        |
| 11.1 | Pagination spike inside an opaque origin                                         | ✅    | **Answered: no, in all three engines.** [reader-sandbox-spike.md](research/reader-sandbox-spike.md) — and it found a default-on escape while it was there   |
| 11.2 | `packages/reader` — a fifth leaf package                                         | ✅    | Sniffing, acquisition, progress, hashing, content-frame policy; foliate vendored, pinned, patched, with a test that fails when the patch lapses             |
| 11.3 | The `/read` route's CSP and the content-frame policy                             | ✅    | Nonce-based `script-src 'self'` from middleware, the engine probe wired in, and four tests that open a hostile book on the real route (`pnpm test:sandbox`) |
| 11.4 | Acquisition: fetch, file picker, drag-and-drop, IndexedDB                        | ✅    | Four ways in, one path out; the CORS dead end offers the download and nothing else; kept files live in IndexedDB and are the reader's own opt-in            |
| 11.5 | Progress, bookmarks and notes                                                    | ✅    | Position and bookmarks in the one record, keyed by content hash; resume through `renderFirstPage`; only a _refused_ write says anything                     |
| 11.6 | Display: themes incl. E-Ink, type, layout                                        | ✅    | Four palettes from `tokens.css`, seven preferences, every one announced; E-Ink is monochrome, motionless and single-column                                  |
| 11.7 | Surfaces: where "Read in browser" appears                                        | ✅    | On a download link and an addon source whose format this reader opens, and nowhere else; measured against this instance's real catalogue                    |
| 11.8 | Settings popups and 15 dictionaries                                              | ⬜    | Every reader preference announces itself through `useSettingChangeToast()` with `outcomeOfWrite` (CLAUDE.md)                                                |
| 11.9 | Zero-knowledge enforcement                                                       | ⬜    | Four `dependency-cruiser` rules plus a Playwright wire suite, `pnpm test:reader`, modelled on `addon-privacy.spec.ts`                                       |

Sizing: this is five or six PRs, not one — rules.md §7 caps a PR at ~400 diff lines. The natural
cuts are 11.0–11.3 (the box), 11.4 (getting a file into it), 11.5–11.6 (living in it), 11.7–11.8
(the surfaces), 11.9 (the proof). 11.9 is not a PR that can be skipped for time: without it the
phase has shipped a promise.

### 11.1 ran first, and it took the preferred design off the table

The question was whether foliate-js can paginate on an opaque origin. It paginates by loading each
spine document into an iframe and **measuring it** — `contentDocument`, CSS columns, scroll widths —
and that needs same-origin access to a frame nested inside a document the sandbox has already made
originless.

**It cannot, in Chromium, Firefox and WebKit alike**, and the reason is the platform rather than the
library: a nested frame inherits its parent's sandbox flags, cannot re-grant `allow-same-origin`, and
therefore lands on its _own_ opaque origin. `blob:`, no attribute at all, `srcdoc` — all three read
back `null` in all three engines. Numbers, probes and the engines' own error messages are in
[reader-sandbox-spike.md](research/reader-sandbox-spike.md).

So the phase takes the fallback branch, and says so in the ADR rather than presenting it as the
plan: **the reader is an ordinary same-origin route**, and the isolation moves down one level onto
the book's own frames. That is weaker than four layers, it is written down as weaker, and it changes
nothing about the invariant above — the invariant was never enforced by the opaque origin, it is
enforced by there being no route to send a book to.

**The spike also found the thing that actually mattered.** foliate sets
`sandbox="allow-same-origin allow-scripts"` on its content frames: it runs the book's JavaScript on
purpose. Against a hostile fixture on an unhardened route, in every engine, the book's inline script,
its external script, an `onerror` handler and `top.postMessage` all got out. A reader built on
defaults would have shipped a code-execution surface fed by files strangers publish. Two independent
walls were then measured, and **both** ship:

- `allow-scripts` stripped from the content frames (a one-line vendor patch) — nothing ran,
  pagination byte-identical;
- a route CSP of `script-src 'self'`, no `'unsafe-inline'`, no `blob:` — `blob:` documents inherit
  the creating context's policy in all three engines, so the book's scripts have no source they can
  be served from even if the attribute regresses.

Two things follow that shrink the rest of the phase: there is no `blob:` module bundling to build
(the reader imports normally, so foliate's lazy `import()` of `epub.js`/`mobi.js`/`fb2.js`/
`comic-book.js` keeps working), and there is no RPC surface — storage is reachable directly.

**And one thing that came from reading the patched line's own comment.** Upstream wanted
`allow-scripts` "for events because of WebKit bug 218086". Measured with a real mouse and keyboard
(11.1b, same document): Chromium and Firefox deliver input to a frame without it; **WebKit delivers
none at all** — no click, no key, nothing. A book in such a frame is a page nobody can tap, on the
engine that is Safari. Since the two walls are independently sufficient, the frame keeps
`allow-scripts` **only** where the engine would otherwise swallow input, and there the CSP is the
wall; everywhere else both stand. The branch is chosen by probing the engine, never by a user-agent
string, and it disappears if WebKit fixes the bug. ADR-0013 §3 carries this as an amendment rather
than a quiet edit, because it is a real reduction from two walls to one for some readers.

### Decided rather than assumed

- **A book file is untrusted code, and is treated as such.** EPUB is HTML, CSS and — unless something
  stops it — JavaScript, delivered by whoever the reader got it from. 11.1 measured what "unless
  something stops it" is worth: on defaults the hostile fixture escaped four ways in three engines.
  So scripts are off twice over — `allow-scripts` stripped from the content frames, and a route CSP
  whose `script-src` the book's blob-served scripts cannot match — and the hostile fixture is a
  build artifact that every format is run against, not a test somebody remembers to write.
- **No `rightsStatus` on anything the reader opens.** Same reasoning as ADR-0009's for addon
  results, and it now applies to a second path: a file the reader picked off their own disk has no
  provenance this instance can speak to. The reader shows the book; the badge stays on the link that
  produced it, where the instance's own pipeline can back it up (ADR-0011).
- **"Read in browser" appears only where there is a file.** A public domain _reading page_ is not a
  file (the free shelf already makes this distinction, `FreeBooks.tsx`), and a `buy` or `borrow`
  link certainly is not. The button follows `download`/`open` links with a supported format, and
  addon sources with a `format` hint — attributed to the addon, as always.
- **CORS gets an honest dead end.** When the direct fetch is refused, the panel says so in the
  reader's language, and offers the three real paths: download the file to the device and open it
  from there, use an addon that serves the file itself, or ask the source's operator. It does not
  offer to try again "through the site", because there is nothing behind that button but the route
  this phase exists not to build.
- **Keeping the file is opt-in and it is a preference.** Progress is a few hundred bytes and is kept
  always; a 40 MB EPUB is not, and putting one in IndexedDB without asking is a decision about
  somebody's disk. Off by default, per book, and — like every other preference here — it announces
  itself, including when the browser refuses the write (`unstored`).
- **The key is a content hash, not a URL and not a work id.** `sha-256` of the `ArrayBuffer`, via
  WebCrypto, in the tab. The same book opened tomorrow from a different mirror resumes where it was
  left; the same URL serving a different file does not silently inherit somebody's bookmarks. The
  hash is a client-side identifier and stays one — it is on the list of things that must never reach
  the origin, because a hash of a file is an identifier for that file.
- **The reader's theme is the reader's, not the site's.** The app follows the system today
  (`prefers-color-scheme`, `tokens.css`) and has no theme switch. Adding a site-wide one is a
  larger decision than this phase; adding one **scoped to the reading surface** is not, and reading
  is where it actually matters. E-Ink is a fifth mode rather than a checkbox on the others: pure
  black on white, no transitions, no shadows, no fade, paged only, heavier stems — the things that
  make an e-paper panel usable are the things a normal theme is built to avoid.
- **PDF is out of scope, and this is a real limitation.** foliate-js supports it experimentally
  through PDF.js, which is a second vendored engine and a dynamic import that a `blob:` module
  cannot resolve. EPUB, FB2, MOBI/AZW3 and CBZ are the four in scope, as asked. A PDF link keeps
  behaving exactly as it does today.
- **Vendored, pinned, and checked.** foliate-js is not published to npm and is meant to be a
  submodule; it is vendored under `packages/reader/vendor/foliate/` with its `LICENSE`, the upstream
  commit SHA in a `VENDOR.md` next to it, and a CI step that recomputes the tree hash. An
  unpinned copy of somebody else's renderer is a supply-chain change nobody will notice.

### Rules for `dependency-cruiser`

Four rules go into `.dependency-cruiser.mjs`, in the same shape and for the same reason as
`addons-never-on-the-server`. Together they say: the reader is a browser-only leaf, the server
cannot reach it, it cannot reach the server, and its vendored renderer is reachable from one place.

```js
{
  name: 'reader-is-a-leaf',
  comment:
    'packages/reader is bundled into the browser (and injected into a sandbox as a blob:), so it ' +
    'must depend on no other workspace package — same rule, same reason, as packages/addons and ' +
    'packages/plugins (docs/adr/0007, 0010, 0013).',
  severity: 'error',
  from: { path: '^packages/reader/src' },
  to: { path: '^(packages/(domain|application|infrastructure|contracts|plugins|addons)|apps)/' },
},
{
  name: 'reader-never-on-the-server',
  comment:
    'The book is the reader\'s and never reaches this instance (docs/adr/0013 §1). Nothing that ' +
    'executes server-side may import packages/reader — that is what makes "the server cannot open ' +
    'a book" a build failure rather than a promise.',
  severity: 'error',
  from: { path: '^(apps/(api|worker)|packages/(domain|application|infrastructure))/' },
  to: { path: '^packages/reader/' },
},
{
  name: 'reader-surface-never-calls-this-instance',
  comment:
    'The reading surface talks to the book and to browser storage, and to nothing else. An import ' +
    'of the API client here is how a "just resume-position sync" endpoint gets born.',
  severity: 'error',
  from: { path: '^apps/web/src/(app/read|components/reader)/' },
  to: { path: '^apps/web/src/lib/(api-client|auth-client)' },
},
{
  name: 'reader-vendor-has-one-door',
  comment:
    'Vendored foliate-js is reached through packages/reader only. A direct import from apps/web ' +
    'would put an unpinned third-party renderer in the app bundle with no wrapper to hold the ' +
    'sandbox contract.',
  severity: 'error',
  from: { pathNot: '^packages/reader/(src|vendor)/' },
  to: { path: '^packages/reader/vendor/' },
},
```

`pnpm boundaries` already runs in CI, so these need no new plumbing. Note what they cannot catch: a
`fetch('/api/…')` written as a string literal inside the reader. That is 11.9's job, and it is why
11.9 exists.

### What the wire suite must prove (`pnpm test:reader`)

Modelled on `addon-privacy.spec.ts` and, like `test:sandbox`, standing on its own — no database, no
API, no seed; its own `next dev`, its own fixtures, runnable by anyone who just cloned the
repository. Four assertions, each about the network log after a real reading session:

1. Open a fixture EPUB from a local fixture origin, turn ten pages, bookmark, reload, resume. Every
   request to **this** origin is a document, an asset or nothing at all — none carries the book's
   URL, its bytes, its hash or a position, in path, query, header or body.
2. Repeat with a file chosen through the picker. Same assertion, and additionally: no request leaves
   the tab at all beyond the app's own assets.
3. Repeat with the fetch failing on CORS. The failure path is where an error report would quietly
   undo the property, which is exactly why Phase 7 tested the same case for addons.
4. The hostile fixture EPUB runs no script, reaches no network, and cannot see the host document.

Chromium-only, stated as Chromium-only. The Firefox/WebKit gap from 7.3 applies here for the same
three reasons and is not re-litigated by a green tick.

### Definition of Done

Beyond the standard checklist in [rules.md §8](rules.md#8-definition-of-done-for-a-task):

- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm boundaries`, `pnpm build` green.
- [ ] `pnpm test:reader` green in Chromium; the state for Firefox and WebKit written down rather
      than implied.
- [ ] **The server-side diff of the whole phase is empty** — `git diff --stat main --` over
      `apps/api`, `apps/worker`, `packages/domain`, `packages/application` and
      `packages/infrastructure` prints nothing. No new route, no new contract, no migration.
- [ ] An EPUB, an FB2, a MOBI/AZW3 and a CBZ each open, paginate, remember a position across a
      reload, and survive a browser restart.
- [ ] The hostile fixture fails at all four attempts (script, network, host DOM, form post), in
      Chromium, Firefox and WebKit, and for **every** supported format rather than EPUB alone.
- [ ] The content-frame patch covers both places foliate creates frames — `paginator.js` and
      `fixed-layout.js` — and a test fails if a vendor bump reintroduces `allow-scripts`. The route
      CSP is verified as a wall in its own right, with the patch reverted, so "two walls" is a
      measurement and not a paragraph.
- [ ] Every reader preference — theme, type size, line height, margins, paged/scrolling, keep-file —
      announces through `useSettingChangeToast()`, derives its outcome from `outcomeOfWrite`, and
      names what changed and what it now affects. A refused write shows `unstored` and the control
      snaps back to the stored value.
- [ ] Every new string exists in all 15 dictionaries under `i18n/dictionaries`; TypeScript will not
      compile otherwise, which is the point.
- [ ] E-Ink mode is verified against `prefers-reduced-motion` and at 1-bit rendering: no animation,
      no gradient, no shadow, contrast measured rather than eyeballed (ADR-0008's method).
- [ ] ADR-0013 merged; `architecture.md` §2 package table, CLAUDE.md's repository structure and the
      README's feature list updated in the same PR.
- [ ] `packages/reader` unit tests cover format sniffing (including a mislabelled extension), the
      progress model, hashing determinism and the acquisition contract; the vendored tree is
      excluded from coverage and from lint, and pinned by SHA.
- [ ] A large-file number is measured and published in this document: a ~60 MB CBZ on a mid-range
      phone either opens or is refused with a stated limit. "It works on my laptop" is not a result.

### Risks, and what each one costs

- ~~**The pagination spike fails (11.1).**~~ It did, in week one as intended. Cost paid: one
  isolation layer, a longer ADR, and a vendor patch to carry. What it bought back was the discovery
  that the renderer runs book scripts by default, which no amount of design review had noticed.
- **CORS is the common case, not the edge case.** Plausible: Gutenberg and Archive.org are usually
  fine, an arbitrary mirror is usually not. If measurement shows the direct fetch mostly fails, the
  feature's centre of gravity moves to the file picker and the local library, and the button's
  wording has to move with it. What does not happen is a proxy.
- **MOBI/AZW3 fidelity.** foliate-js reads them; "reads" and "renders the way Kindle does" are
  different claims. Each format gets a fixture and an honest note, not a checkbox.
- **Memory.** The design holds the whole file in an `ArrayBuffer` by construction — that is what
  "never touches the server" means. Mobile Safari will kill a tab over this at some size, and the
  DoD above requires finding that size instead of hoping.
- **Scope creep into sync.** "Read position on my phone and my laptop" is the first thing anyone
  will ask for, and it is a server feature wearing a reader's clothes. It would need an account, a
  route and a database column — and it would end this phase's invariant. If it is ever built, it is
  a different ADR that says so out loud.

### Explicitly not in scope

Text-to-speech, dictionary lookup, translation inside the reader, annotation export, cross-device
sync, PDF, DRM of any kind (there is no path here that could open a DRM-protected file, and none
will be added), and any reading statistic that leaves the tab.

---

## Next step

Phase 0, data scouting: assemble the 50-book sample and get the completeness numbers. Everything
else in the plan depends on that answer.
