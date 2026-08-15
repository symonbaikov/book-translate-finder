# How to contribute to Golden Library

Thank you for your interest in the project! Before opening a PR, read this file in full —
it is short, but a couple of its rules are strict.

## The main rule (violation = PR closed without discussion)

**PRs with shadow library integrations are not accepted.** No scraping and no links to
Library Genesis, Anna's Archive, Z-Library, and the like — neither as a data source, nor as a
link source, nor "behind an optional flag", nor "for personal use". This is not a maintainer's
preference but an architectural and legal invariant of the project: it is enforced in the domain
code (`LinkPolicy`), covered by tests, and described in [docs/legal-policy.md](docs/legal-policy.md).
A direct download link is allowed **only** for public domain / open-license works from the
provider allowlist.

This is a rule about **this codebase**, not about the reader. Addons are installed by readers from
URLs they find themselves, run on their own devices or on their authors' servers, and are not
inspected by the engine ([ADR-0009](docs/adr/0009-blind-core-link-policy-scope.md)). That distinction
is what makes the following three also closed without discussion, and it is not negotiable in either
direction:

- an addon shipped in this repository, or added to any list, directory or default set inside it;
- a content check, denylist or "trusted addons" mechanism layered over addon results;
- an API route that fetches a URL it is given, in any form — the OPDS relay takes a feed **id**
  and stays that way.

## Before you start

1. Read [docs/rules.md](docs/rules.md) — SOLID, idempotency, code and testing rules.
2. For a new layer/module — [docs/architecture.md](docs/architecture.md). Dependency
   direction is strictly inward: `apps → infrastructure → application → domain`; `domain`
   imports nothing from the project. Boundary violations fail CI (`pnpm boundaries`).
3. A new external data source is connected only through a port in `domain` and an adapter in
   `infrastructure` — and only a legal one (see above).

## Local development

```bash
pnpm install
cp .env.example .env
docker compose -f docker/docker-compose.dev.yml up -d
pnpm db:migrate && pnpm db:seed
pnpm dev
```

Details — in [CLAUDE.md](CLAUDE.md) (the command contract) and [README.md](README.md).

## PR requirements

- `pnpm lint && pnpm typecheck && pnpm boundaries && pnpm test` pass locally.
  `pnpm test:integration` requires a running Docker (Testcontainers).
- New logic is covered by tests. Any write operation invoked by a job or a retry is
  idempotent (an `INSERT` without a conflict strategy is a review error).
- Code, comments, commits, identifiers, documentation, and user-facing UI text — all in English.
- Secrets and source API keys — only via environment variables; `.env` is not committed.
- One PR — one meaningful change. Split "while we're at it" refactoring into separate PRs.

## How to add a book the author publishes for free

A book still under copyright whose author or publisher gives it away legally belongs in
`packages/domain/src/policy/authorized-free-catalog.ts`. Adding one is a single PR with a single
entry — no code, no migration.

The entry must include:

- `authorization` — the rights holder's **own** page granting the free copy. Not a mirror, not an
  aggregator, not a search result. This is the evidence the review checks.
- `license` — the permission as the rights holder words it (e.g. "CC BY-NC-SA 3.0, released by
  the author").
- `verifiedOn` — today's date, meaning you opened that page and it still says so.
- `downloads` — direct https URLs, one per format, each of which you actually downloaded.

What will be rejected: links found by web search, links to "free ebook" aggregators, and anything
where the permission is assumed rather than stated. If the author's page is gone, the book does
not go in — see [ADR-0004](docs/adr/0004-authorized-free-catalog.md).

## How to propose a new data source

Open an issue describing: what the source is, what official API/data dumps it has, its terms
of use (ToS), rate limits, and whether it has author and language fields. Sources without an
official API (HTML only) are not suitable — see the main rule.
