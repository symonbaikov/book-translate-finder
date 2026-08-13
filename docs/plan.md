# BookTranslate Finder Implementation Plan

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
  validated by a Zod schema from `@btf/contracts` before reaching a page (docs/architecture.md §2.5 —
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

## Next step

Phase 0, data scouting: assemble the 50-book sample and get the completeness numbers. Everything
else in the plan depends on that answer.
