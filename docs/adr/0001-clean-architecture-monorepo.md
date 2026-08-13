# ADR-0001: Clean Architecture in a pnpm monorepo with layers as packages

- **Status:** accepted
- **Date:** 2026-08-12
- **Task context:** initial project planning

## Context

The project aggregates data from several external sources (Open Library, Google Books, later
WorldCat, Index Translationum), and their number will grow. Sources are unstable, rate-limited,
and use different formats. At the same time, the system is subject to strict legal invariants
([legal-policy.md](../legal-policy.md)) that must not be allowed to smear across controllers and
UI components. We need a structure where adding a source does not touch business scenarios, and
where the rules are checked automatically rather than in code review.

## Decision

We use Clean Architecture with four layers organized as separate pnpm-workspace packages:
`domain` → `application` → `infrastructure` → `apps`. Dependencies point inward only.
`packages/domain` has zero external dependencies. All external interactions go through ports
declared in `domain` and adapters in `infrastructure`. Dependency composition happens only in
`apps/*`.

Import boundaries are checked in CI by the `pnpm boundaries` command (dependency-cruiser); a
violation fails the build. `eslint-plugin-boundaries` was considered as an alternative, but in
the pnpm + ESM + TS project references combination it failed to resolve imports between packages
(`@btf/*`) and silently let violations through — discovered and confirmed by experiment during
Phase 1.0, so the plugin was dropped.

## Considered alternatives

| Option                                             | Pros                                | Cons                                                                                            | Why not chosen                                 |
| -------------------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Layers as folders inside a single package          | Easier start                        | Boundaries hold only by discipline; nothing stops an "outward" import                           | The main value is enforceability of boundaries |
| Standard modular NestJS without an explicit domain | Faster to write the first endpoints | Business rules grow onto the framework; legal invariants spread across services and controllers | Unacceptable for the legal-policy invariants   |
| Full-blown microservices                           | Independent deployment              | Overengineering for a solo developer on an MVP; distributed transactions break idempotency      | Not justified at the current scale             |

## Consequences

- Adding a source = a new adapter + registration in the composition root; use cases don't change.
- Domain rules (including `LinkPolicy`) are tested without a DB, network, or framework.
- The price: more files and explicit "DB row ↔ entity" mapping at the start; setting up project
  references and boundaries takes Phase 1.0.
- If the project stays very small, the structure will prove excessive — but the reverse move
  (merging packages) is cheaper than untangling layers that have fused together.
