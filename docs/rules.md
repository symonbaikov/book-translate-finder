# Development Rules

A normative document. Items marked "review error" block merging.
Complements [architecture.md](architecture.md) (structure) and [legal-policy.md](legal-policy.md)
(legal invariants).

---

## 1. SOLID — how it applies here

The principles are given not as theory but as concrete rules for this codebase.

### S — Single Responsibility

- One use case = one file = one class = one public method `execute`.
- A class that simultaneously makes HTTP calls, writes to the DB, and decides a business rule
  gets split up.
- Violation smell: the class name contains "And", or the class changes for reasons from
  different areas (the Open Library format changed **and** the deduplication logic changed).

### O — Open/Closed

- A new data source is added as a **new implementation** of `BookMetadataProvider` plus
  registration in the composition root. No edits to existing use cases are required.
- `switch (source)` inside a use case is a review error. Use a provider registry instead
  (`Map<ProviderId, BookMetadataProvider>`), populated in `apps/*`.

### L — Liskov Substitution

- Every implementation of a port must honor its contract: no throwing its "own" error types
  past the domain ones, no returning `null` where the contract promises an empty array, no
  changing idempotency semantics.
- A port contract is covered by a **shared test suite**: one test suite runs against every
  implementation of the port (including the in-memory fake). A provider that fails the shared
  suite does not get wired in.

### I — Interface Segregation

- Ports are narrow and scenario-driven. `WorkRepository` does not turn into a "Repository with
  every method for every occasion": if a use case only needs `findByNaturalKey`, it depends on
  a port with that method.
- A fat port with 15 methods of which a given use case uses two is a review error.

### D — Dependency Inversion

- A use case depends on an interface from `domain`, not on a class from `infrastructure`.
- All dependencies arrive through the constructor. `new PgWorkRepository()` inside a use case,
  or an import from `infrastructure` into `application`, is a review error (enforced by the
  boundaries linter).
- The only place where concrete classes are known is the composition root in `apps/*`.

---

## 2. Idempotency

The system is built on the **at-least-once** assumption: the queue may deliver a job twice,
the client may retry a request, cron may overlap with itself. Idempotency is therefore not an
optimization but a correctness requirement.

### 2.1 The general rule

> Re-executing an operation with the same input leaves the system in the same state as a
> single execution, and returns the same result.

### 2.2 Database writes

- Any insert of data from an external source — only `INSERT ... ON CONFLICT (natural_key)
DO UPDATE`. A bare `INSERT` for such data is a review error.
- **The natural key is computed deterministically** from the content:
  - `work.natural_key = sha256(normalize(original_title) + '|' + normalize(author))`
  - `edition.natural_key = isbn13` or `sha256(work_id|language|publisher|year|normalize(title))`
  - `source_link.url_hash = sha256(canonicalize(url))`
- `normalize()` (lowercasing, whitespace collapsing, removal of diacritics and punctuation,
  transliteration) is a pure function in `domain`, covered by table-driven tests. Its
  instability breaks the idempotency of the whole system, so it may only be changed together
  with a key-recomputation migration.
- `updated_at` is updated only when fields actually change (compare before writing),
  otherwise the "freshness" metric lies.

### 2.3 Queues

- `jobId` is set explicitly and deterministically: `sync-{source}-{workId}-{YYYY-MM-DD}` —
  hyphen-separated, not colons: BullMQ hard-rejects `:` in custom ids
  (`Custom Id cannot contain :`), caught by an integration test in Phase 1.3. BullMQ drops the
  duplicate itself.
- The handler does not rely on "the job runs exactly once": it must be correct when re-run at
  any point, including a crash midway.
- All writes of a single job go in one transaction (`UnitOfWork`). Partial application does not happen.

### 2.4 Mutating HTTP endpoints

- `POST /api/sync/:source` requires an `Idempotency-Key` header (a client-supplied UUID).
- Algorithm: look up `(key, endpoint)` in `idempotency_key` →
  - found and `request_hash` matches → return the stored response, do nothing;
  - found and `request_hash` differs → `409 Conflict`;
  - not found → execute in a transaction together with saving the key and the response.
- Key TTL — 24 hours, cleanup by a separate job.

### 2.5 Dump imports (Phase 2)

- The import is split into batches with a checkpoint (row number/offset) in `sync_log`.
  A restart continues from the last checkpoint; reprocessing a batch is safe thanks to upserts.

### 2.6 Pre-merge checklist for a write operation

- [ ] There is a natural key or an explicit unique index covering the conflict.
- [ ] An `ON CONFLICT` strategy is specified.
- [ ] The write is atomic (one transaction per logical operation).
- [ ] There is a test "run twice → state and result identical to a single run".
- [ ] A retry after an artificial mid-way failure produces no duplicates (test).

---

## 3. Other mandatory principles

### Explicit boundaries (Ports & Adapters)

The outside world enters the system only through a port. A direct `fetch`, `pg`, or `ioredis`
outside `packages/infrastructure` is a review error.

### Fail fast on input, resilience on output

- API input is validated by a Zod schema from `contracts` before it reaches a use case; an
  invalid request fails immediately with `400`.
- Outbound calls to sources: timeout (5 s by default), up to 3 retries with exponential
  backoff and jitter **for idempotent operations only**, a circuit breaker per provider,
  compliance with the source's published limits.

### One failing source does not break the response

The book card is served with data from the sources that are available; WorldCat being down
does not turn into a `500`. Degradation means partial data plus an incompleteness marker, not
an error.

### Immutability in the domain

Domain entities are immutable: a change returns a new object. There are no setters.

### Explicit over implicit

No hidden global singletons, no reading `process.env` outside the configuration layer.
The config is parsed by a Zod schema once at startup; an invalid config = crash at startup.

### No business logic in controllers and React components

Controller: validation → use case call → mapping to HTTP. Component: presentation. The rule
"whether to show the download link" lives in `domain`, not in JSX.

### Determinism

Time and identifiers come only through the `Clock` and `IdGenerator` ports. `Date.now()` and
`crypto.randomUUID()` inside `domain`/`application` are a review error.

---

## 4. Code style and types

- TypeScript in `strict`, plus `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`.
- `any` is forbidden; use `unknown` + type narrowing. Exceptions require a comment and a
  per-line `eslint-disable`.
- Public package functions have explicit return types.
- Errors: domain errors are separate classes extending `DomainError`. Catching and swallowing
  an exception without logging and without transformation is a review error.
- Naming: files `kebab-case.ts`, classes `PascalCase`, functions/variables `camelCase`,
  constants `UPPER_SNAKE_CASE`, ports `*.port.ts`, use cases `*.use-case.ts`, adapters
  `*.adapter.ts` / `*.repository.ts`.
- Comments explain "why", not "what". Commented-out code is not committed.
- Formatting — Prettier, linting — ESLint; both mandatory in CI.

---

## 5. Testing

| Level       | What it covers                                                      | Tool                    | Where                                 |
| ----------- | ------------------------------------------------------------------- | ----------------------- | ------------------------------------- |
| Unit        | Domain rules, normalization, `LinkPolicy`, use cases on port fakes  | Vitest                  | next to the code                      |
| Contract    | Shared suite for all implementations of a port, including in-memory | Vitest                  | `packages/*/test/contract`            |
| Integration | Repositories and queues against real Postgres/Redis                 | Vitest + Testcontainers | `apps/api`, `packages/infrastructure` |
| E2E         | "Search → card → links" scenarios                                   | Playwright              | `apps/web/e2e`                        |

Requirements:

- External HTTP sources are mocked in tests with recorded responses (fixtures); no network is
  needed in CI.
- Every write operation gets an idempotency test (double run).
- `LinkPolicy` gets tests proving that a link to a shadow library and a direct download of a
  copyrighted edition are impossible (see `legal-policy.md`).
- Coverage: `domain` and `application` ≥ 90%; overall CI threshold ≥ 80%.
- Every new bug is fixed together with a test that reproduces it.

---

## 6. Working with external sources

- Each source is a separate adapter, a separate queue, a separate circuit breaker.
- Keys and limits come from configuration, never from code.
- Source responses are cached at the adapter level (Redis, TTL per source), so a retry and a
  neighboring job do not spend the quota twice.
- The User-Agent contains the project name and a contact — public-API etiquette requires it
  (Open Library).
- Conditional requests (`If-None-Match` / `If-Modified-Since`) are used wherever the source
  supports them.
- HTML scraping is forbidden in all cases (see `legal-policy.md`).

---

## 7. Git and process

- Branches: `main` is always deployable; work happens in `feat/*`, `fix/*`, `chore/*`, `docs/*`.
- Commits — Conventional Commits (`feat(api): add editions endpoint`), in English.
- Merging into `main` only via a PR with green CI: `lint`, `typecheck`, `test`, `build`,
  layer-boundary check.
- PR ≤ ~400 diff lines; anything bigger gets split.
- Changing an architectural decision = an ADR in `docs/adr/` in the same PR.
- DB migrations are forward-only (`db:generate` → SQL review → `db:migrate`). Manually editing
  an applied migration is forbidden.
- Secrets are not committed; `.env.example` is kept up to date together with config changes.

---

## 8. Definition of Done for a task

- [ ] The code follows the dependency direction from `architecture.md`.
- [ ] Logic is in the right layer; ports are not bypassed.
- [ ] Write operations are idempotent; the §2.6 checklist passes.
- [ ] Tests at the appropriate levels are written and pass locally.
- [ ] `pnpm lint && pnpm typecheck && pnpm test` are green.
- [ ] The public API is described in `contracts` and made it into OpenAPI.
- [ ] Documentation is updated if the contract or architecture changed.
- [ ] The legal policy is not violated (§ `legal-policy.md`); the policy tests pass.
