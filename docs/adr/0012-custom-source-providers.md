# ADR-0012: Custom source providers — configuration, not code

- **Status:** accepted
- **Date:** 2026-08-15

## Context

`bookstore-catalog.ts` ships ~90 stores as `{ id, name, country, buildUrl }` entries, and
`PluginKind`/`PluginAccessMode` in `packages/plugins` already anticipates a fourth integration
shape — `accessMode: 'url-template'` — that nothing implemented: a source whose entire behaviour is
"take a book, produce a URL from a template", never fetched by this instance. A reader who wants one
more shop than the shipped catalog has two bad options today: ask for it to be hardcoded upstream
(a PR and a release per shop), or use `AddonSources` (`packages/addons`), which is built for a much
larger job — a whole HTTP or sandboxed-JS protocol with `manifest.json`, three resource types, and
consent screens — to solve a one-line problem.

## Decision

### 1. The contract lives in `packages/plugins`, as data plus one pure function

`SourceProviderConfig` (`{ id, name, urlTemplate, enabled, params?, homepage?, countries? }`),
`BookQueryMeta`, and `SourceProvider.resolveSearchUrl(bookMeta): string | null` are declared in
`packages/plugins/src/url-source/`, the same dependency-free leaf `apps/web` and the server both
import. `createCustomSourceProvider(config)` turns a config into a `PluginManifest & { kind:
'url-source' }` plus a `resolveSearchUrl` closure — structurally the same move as
`createCustomFeedPlugin` for OPDS catalogs (`feed-catalog.ts`), and `activeSourceProviders(configs)`
composes with the existing `PluginRegistry<T>` unchanged: no new registry class, because the
existing one already is "a declarative registry that accepts plugin objects" — only the object
shape was missing.

### 2. `formatUrlTemplate` fills `{tokens}` and refuses to half-fill

`{isbn}`, `{title}`, `{author}`, `{language}` come from the book; `{query}` is `bookstore-catalog`'s
own ISBN-or-"title author" fallback, reused rather than reinvented; anything else (`{domain}`, most
often) comes from the config's own `params`. If a placeholder the template actually uses has no
value, the function returns `null` instead of a URL with a literal `{isbn}` still in it — the same
reasoning `bookstore-catalog.ts` gives for leaving a store out entirely rather than guessing: a link
that lands on a broken search is worse than no link.

### 3. Storage is client-only, and looks like `installed-addons.ts` on purpose

A URL template a reader types in is theirs. `apps/web/src/lib/custom-source-providers.ts` persists
`SourceProviderConfig[]` to `localStorage` under `btf.custom-sources` — no new wire format, since the
config type already carries everything a settings screen needs. This is the same zero-knowledge
shape ADR-0010 chose for addons, for the same reason: nothing under `apps/api` may import this
config's shape, and `pnpm boundaries` does not need a new rule to say so, because nothing here ever
crosses into a package the server touches.

### 4. Installing is one step, not two

`AddonManager`'s two-step consent flow exists because an addon is somebody else's code that will run
and contact hosts the reader has not seen yet. A custom source is a URL template the reader wrote
themselves; there is nothing about it for a consent screen to disclose that the form fields did not
already show. `CustomSourceManager` (`/custom-sources`) is a single add/toggle/remove list, and
`CustomSources` renders resolved links next to the shipped bookstore catalog inside `EditionLinks` —
one more group in the same shelf, so a reader does not have to learn this came from a different
mechanism than "Find in a bookstore".

## Consequences

**Good.** Adding a shop the project has not shipped is now a form, not a release. The contract is
small enough that `SourceProviderConfig` doubles as the stored record with no adapter layer between
them. Nothing new crosses the dependency boundaries `packages/domain`/`application`/`infrastructure`
already enforce.

**Costs, honestly.** A custom source's URL is exactly what the reader typed and this instance does
not vet it, matching the stance ADR-0009 already took for OPDS catalogs a reader adds — the caption
next to the rendered links says so. Two different names that slugify to the same id are
disambiguated silently (`my-shop-2`); two sources under the *same* name are rejected outright, so the
per-edition chip list and the management list never show two entries a reader cannot tell apart.
