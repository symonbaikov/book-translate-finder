# CLAUDE.md

Instructions for Claude Code and any agent/developer working in this repository.

## What this project is

**BookTranslate Finder** is an open book translation aggregator. The user enters a title and
author, and the service answers: which languages the book has been translated into, which
editions exist, and where to get the text **legally** — direct download for public domain works,
a deep link to purchase, or library borrowing for books under copyright.

The value is not in the data (it is already open: Open Library, Google Books, WorldCat, Index
Translationum), but in **aggregation, normalization, and human UX** on top of scattered sources.

The project is open-source and designed for **self-hosting**: anyone should be able to deploy
their own copy with three commands via Docker Compose. This shapes decisions — configuration
only via `.env`, automatic migrations, optional keys for paid sources, and a fresh
installation's empty database fills lazily on first requests.

Original brief: [BookTranslate_Finder_Plan.pdf](docs/source/BookTranslate_Finder_Plan.pdf) →
broken down into the documents below.

## The project's main invariant (must not be violated)

No scraping and no links to shadow libraries (Library Genesis, Anna's Archive,
Z-Library, and the like) — neither as a data source nor as a link source. A direct download
link is allowed **only** for public domain / open-license works from the provider allowlist.
This is an architectural decision and a legal risk, not a preference — see [docs/legal-policy.md](docs/legal-policy.md).
The rule is enforced in the domain code and covered by tests; in a conflict with any other
task, this rule wins.

## Documentation

| File                                         | Purpose                                                   |
| -------------------------------------------- | --------------------------------------------------------- |
| [docs/plan.md](docs/plan.md)                 | Work phases, tasks, Definition of Done, success criteria  |
| [docs/architecture.md](docs/architecture.md) | Clean Architecture layers, modules, ports, DB schema, API |
| [docs/rules.md](docs/rules.md)               | SOLID, idempotency, code, testing, and commit rules       |
| [docs/legal-policy.md](docs/legal-policy.md) | Legal policy as executable invariants                     |
| [docs/adr/](docs/adr/)                       | Architecture Decision Records                             |

Before changing code, read `docs/rules.md`. Before adding a layer/module — `docs/architecture.md`.

## Stack

TypeScript (strict) · Next.js + React (web) · NestJS on Fastify (API) · PostgreSQL + Drizzle ORM ·
Redis · BullMQ (background jobs) · Docker Compose (local) · GitHub Actions (CI/CD) ·
Vitest + Testcontainers + Playwright (tests).

## Repository structure

```
apps/
  web/            Next.js — search, book card, editions and links list
  api/            NestJS/Fastify — REST, rate limiting, dependency composition
  worker/         BullMQ workers — source synchronization, dump imports
packages/
  domain/         Entities, value objects, domain rules, PORTS. Zero external dependencies
  application/    Use cases (interactors). Depend only on domain
  infrastructure/ Adapters: Postgres, Redis, source HTTP clients, queues
  contracts/      Zod schemas and DTOs shared by web and api
docs/             Project documentation
docker/           Compose files, Dockerfiles
```

Dependency direction is strictly inward: `apps → infrastructure → application → domain`.
`domain` imports nothing from the project except itself.

## Commands

> The commands below are a **contract**: they work exactly in this form and are verified live at
> every phase. Do not invent alternative script names — edit this list if the contract changes.

The package manager is **pnpm** (workspaces).

### Running

```bash
pnpm install
```

```bash
cp .env.example .env
```

```bash
docker compose -f docker/docker-compose.dev.yml up -d
```

```bash
pnpm db:migrate && pnpm db:seed
```

```bash
pnpm dev
```

`pnpm dev` starts web (`http://localhost:3000`), api (`http://localhost:3001`), and worker
in parallel. Individually: `pnpm --filter @btf/web dev`, `pnpm --filter @btf/api dev`,
`pnpm --filter @btf/worker dev`.

apps/api and apps/worker read the root `.env` directly (`tsx --env-file=../../.env`). apps/web
is a Next.js application and reads environment variables only from its **own** directory
(`apps/web/.env.local`), not from the monorepo root — this is a limitation of Next.js itself,
not a project decision. One-time:

```bash
cp apps/web/.env.example apps/web/.env.local
```

### Code quality

```bash
pnpm lint
```

```bash
pnpm typecheck
```

```bash
pnpm format
```

### Tests

```bash
pnpm test
```

```bash
pnpm test:unit
```

```bash
pnpm test:integration
```

```bash
pnpm test:e2e
```

`test:integration` starts Postgres and Redis via Testcontainers — a running Docker is required.

### Database

```bash
pnpm db:generate
```

```bash
pnpm db:migrate
```

```bash
pnpm db:seed
```

Seeding an empty database with a curated core of popular books (idempotent, `--limit=N` for a
quick check; requires running Postgres/Redis and access to Open Library):

```bash
pnpm db:seed:catalog
```

### Source synchronization (manual run)

```bash
pnpm sync -- --source=open-library --work=<workId>
```

### Build

```bash
pnpm build
```

### Self-hosting (the target scenario for the project's users)

Deploying someone else's copy is three commands, with no building from source and no manual
migrations. The root `docker-compose.yml` pulls prebuilt images from GHCR; migrations are run
by a separate one-shot `migrate` service.

```bash
cp .env.example .env
```

```bash
docker compose up -d
```

```bash
docker compose logs -f api
```

Updating the version:

```bash
docker compose pull && docker compose up -d
```

Database backup:

```bash
docker compose exec -T postgres pg_dump -U btf btf | gzip > backup-$(date +%F).sql.gz
```

Details on the topology, environment variables, and the cold-database problem solution —
[architecture.md §9](docs/architecture.md#9-deployment-and-self-hosting) and
[ADR-0003](docs/adr/0003-lazy-backfill.md).

## Agent workflow rules in this repository

- Start with `docs/plan.md`: identify the current phase and do not go beyond its scope without an explicit request.
- Do not add a dependency to `packages/domain`. Ever.
- Any external data source is connected only through a port in `domain` and an adapter in
  `infrastructure`. A direct `fetch` call from a use case is a review error.
- Any write operation invoked by a job or a retry must be idempotent
  (see the "Idempotency" section in `docs/rules.md`). A new `INSERT` without a conflict strategy is a review error.
- Secrets and source API keys — only via environment variables; `.env` is not committed.
- Respond to the user in Russian; code, code comments, commits, identifiers, documentation, and all UI text — in English.
