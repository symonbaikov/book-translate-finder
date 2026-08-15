# CLAUDE.md

Instructions for Claude Code and any agent/developer working in this repository.

## What this project is

**Golden Library** is an open book translation aggregator. The user enters a title and
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

**This instance** does not scrape, and does not link to shadow libraries (Library Genesis, Anna's
Archive, Z-Library, and the like) — neither as a data source nor as a link source. A direct download
link is allowed **only** for public domain / open-license works from the provider allowlist.
This is an architectural decision and a legal risk, not a preference — see [docs/legal-policy.md](docs/legal-policy.md).

"This instance" is the boundary, and it is exact: everything the server fetches, stores in Postgres
or serves from `/api`. It does **not** cover what a reader-installed addon returns on the reader's
own device — that path never touches the server, is never gated, and is never given a rights status
this project cannot know ([ADR-0009](docs/adr/0009-blind-core-link-policy-scope.md),
[ADR-0010](docs/adr/0010-addon-engine.md)). The two kinds of link are different types that meet only
in the React tree, where each addon result is attributed to the addon that produced it. Converting
one into the other, or letting `packages/addons` be imported from `apps/api` or
`packages/infrastructure`, is a review error.

The rule is enforced in the domain code and covered by tests; in a conflict with any other
task, this rule wins.

## Documentation

| File                                             | Purpose                                                   |
| ------------------------------------------------ | --------------------------------------------------------- |
| [docs/plan.md](docs/plan.md)                     | Work phases, tasks, Definition of Done, success criteria  |
| [docs/architecture.md](docs/architecture.md)     | Clean Architecture layers, modules, ports, DB schema, API |
| [docs/rules.md](docs/rules.md)                   | SOLID, idempotency, code, testing, and commit rules       |
| [docs/legal-policy.md](docs/legal-policy.md)     | Legal policy as executable invariants                     |
| [docs/addon-protocol.md](docs/addon-protocol.md) | The addon contract, for authors outside this repository   |
| [docs/adr/](docs/adr/)                           | Architecture Decision Records                             |

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
  plugins/        Isolated integrations that run in the browser AND in Node: OPDS client,
                  bookshop lookup, the plugin contract. Zero project dependencies (ADR-0007)
docs/             Project documentation
docker/           Compose files, Dockerfiles
```

Dependency direction is strictly inward: `apps → infrastructure → application → domain`.
`domain` imports nothing from the project except itself. `plugins` is a leaf too: it depends on no
other workspace package, which is what lets `apps/web` and `packages/infrastructure` both import it
without either learning about the other ([ADR-0007](docs/adr/0007-plugin-architecture.md)).

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
in parallel. Individually: `pnpm --filter @golden/web dev`, `pnpm --filter @golden/api dev`,
`pnpm --filter @golden/worker dev`.

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

```bash
pnpm test:sandbox
```

`test:integration` starts Postgres and Redis via Testcontainers — a running Docker is required.

### Addons

```bash
pnpm addon:validate https://addon.example/manifest.json
```

Checks a third-party addon against the same schemas the engine uses and then exercises every resource
its manifest declares, using ids discovered from its own catalog. The protocol it validates against is
[docs/addon-protocol.md](docs/addon-protocol.md); a runnable template is
[examples/addon-template](examples/addon-template). Requests go to the addon and nowhere else.

`test:sandbox` is the addon sandbox's escape suite. Unlike `test:e2e` it needs no database, no API
and no seeding — it starts its own `next dev` on port 3100 and drives the real
`public/addon-sandbox.html` with its real CSP header. Keep it that way: a security suite that is
hard to run is a security suite nobody runs.

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
- **Every change to a reader's setting must announce itself in a popup.** See the section below —
  a new preference with no popup, or a reworded feature whose popup still describes the old
  behaviour, is a review error.
- Respond to the user in Russian; code, code comments, commits, identifiers, documentation, and all UI text — in English.

## Settings popups (apps/web)

Every preference in this app is written straight into the reader's own browser — a cookie or
`localStorage`, never a server-side profile — and takes effect with no "Save" button to press.
That leaves nothing on screen to confirm anything happened, and the write itself can fail
silently (private mode, blocked storage, cookies off). So each change is announced in a popup,
built on [`sonner`](https://sonner.emilkowal.ski/) and mounted once in
[SettingsToaster.tsx](apps/web/src/components/SettingsToaster.tsx).

Statuses live in [`lib/setting-change.ts`](apps/web/src/lib/setting-change.ts) — four, and only
these four:

| Outcome    | Means                                                  | Shown as        |
| ---------- | ------------------------------------------------------ | --------------- |
| `saved`    | new value in effect **and** written down               | green, "Saved"  |
| `cleared`  | back to the default, or an entry removed               | blue, "Cleared" |
| `unstored` | the browser refused to keep it, so nothing took effect | amber, longer   |
| `failed`   | refused by the server or by policy; nothing changed    | red, longer     |

`unstored` is a real failure, not a partial success: nothing here holds a preference in memory —
every panel re-reads the cookie or `localStorage` when it refetches — so a write that did not land
is a change that did not happen. Its message replaces the caller's sentence rather than following
it, and a control that moved on its own must be snapped back to the stored value (see
[CountrySelector.tsx](apps/web/src/components/CountrySelector.tsx)). If you ever add a preference
that _is_ held in memory, that is a new outcome, not a reuse of this one.

Rules when you touch anything a reader can set:

- Announce through `useSettingChangeToast()`
  ([lib/settings-toast.tsx](apps/web/src/lib/settings-toast.tsx)) and nothing else. A bare
  `toast()` call in a component is a review error — it drifts in wording, in duration, and in
  what it calls success.
- Derive the outcome with `outcomeOfWrite(persisted, intent)`, never by hand. Storage helpers
  return a boolean saying whether the value was really persisted; a helper that swallows its
  write failure and returns `void` is a review error, because the popup would then promise a
  preference that dies on reload.
- The message says **what changed and what it now affects** — the old value, the new one, and the
  consequence. "Saved" alone is not a message: the reader already knows they clicked.
- Every string goes through the dictionaries under
  [i18n/dictionaries](apps/web/src/i18n/dictionaries) (`settings.*` keys), in all languages.
  TypeScript will not compile until each one has them.
- **Changing a feature means changing its popup in the same commit.** If the behaviour a message
  describes moves — a preference now affects something else, is stored somewhere else, or lasts
  a different length of time — the message is now wrong, and a wrong explanation is worse than
  none. Fire it only on a real change, too: a popup that appears on every page load is wallpaper
  (see [RememberBookLanguage.tsx](apps/web/src/components/RememberBookLanguage.tsx), which
  compares against the stored value first).
