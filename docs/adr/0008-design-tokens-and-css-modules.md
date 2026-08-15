# ADR-0008: Design tokens, vendored typefaces, and CSS Modules

- **Status:** accepted
- **Date:** 2026-08-14
- **Task context:** Phase 6 — interface redesign ([plan.md](../plan.md#phase-6--interface-redesign))

## Context

The brief for the redesign is a look that reads as expensive without a single gold frame: exact
typography, a calm interface, large comfortable controls, high contrast, no advertising noise —
Apple Books crossed with Stremio. Three things about the existing front end stand in the way, and
none of them is a matter of taste:

1. **There is no system, only a stylesheet.** `apps/web/src/app/globals.css` had grown to 770 lines
   in which a colour, a radius and a duration were decided wherever they were first needed. Two
   near-identical greys, three shadow recipes and four button paddings is not a style someone
   chose; it is the residue of twenty separate decisions. A "perfect card" cannot be specified in
   such a file, because there is nowhere to say what a card _is_.
2. **The palette was a default.** `#2563eb` on `#f8fafc` is the colour of every admin panel
   written since 2020. It is not wrong; it is anonymous, and anonymity is the opposite of the
   brief.
3. **The typeface was whatever the reader's system happened to have.** On macOS that is a good
   face; on Linux and Android it is not. A product whose subject is _books_ cannot leave its book
   titles to chance.

Two project constraints shape the answer. Self-hosting means **no third-party requests at
runtime** — a `fonts.googleapis.com` link would expose every reader of every private instance and
would break an air-gapped install outright. And every reader-facing preference must announce itself
in a popup ([CLAUDE.md](../../CLAUDE.md)), which makes "add a theme switcher" a heavier decision
than it looks.

## Decision

**A two-layer token file** (`apps/web/src/styles/tokens.css`) is the only place a colour, radius,
spacing step, control height, duration or type size is decided. Primitives (`--n-900`,
`--indigo-400`) are a palette and are never named by a component; semantics (`--surface-2`,
`--accent`, `--control-h-lg`) are roles and are the only thing components may use. The theme swap
touches the semantic layer alone.

**Light and dark are equals, driven by `prefers-color-scheme`, with no switcher.** They are not one
design and its inversion: depth in the dark comes from stacked surfaces and hairline edges, because
a shadow on a near-black background is invisible; in the light it comes from real shadows on warm
paper. Same token names, different mechanisms. No switcher means no new stored preference, and
therefore no new settings popup to keep truthful.

**Typefaces are vendored into the repository** — Inter Variable for the interface, Literata
Variable for book titles and headings — split into `latin`, `latin-ext`, `cyrillic` and
`cyrillic-ext` by `unicode-range`, with metric-matched `@font-face` fallbacks so the swap at first
paint does not move the page. `ar`, `ja`, `ko` and `zh` fall through to the reader's system fonts:
vendoring CJK would add tens of megabytes to the repository for four locales whose systems already
ship a good face.

**Component styles live in CSS Modules** under `apps/web/src/ui/`, one `.module.css` per component.
`globals.css` keeps only the reset and the base element styles.

## Considered alternatives

| Option                                        | Pros                                                            | Cons                                                                                                                                    | Why not chosen                                                                                                                  |
| --------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Tailwind v4                                   | Tokens and utilities out of the box; fast iteration on layout   | A build-step dependency for the whole web app; every component rewritten as class strings; the "premium" decisions end up inline in JSX | The problem is that decisions are scattered — moving them from CSS into `className` strings scatters them differently, not less |
| A `packages/ui` workspace package             | Makes "every button is the same button" enforceable across apps | There is exactly one consumer (`apps/web`); a package boundary now buys a versioning problem, not a guarantee                           | Deferred, not rejected: `src/ui/` has the same shape and can be lifted into a package the day a second consumer appears         |
| Keep extending `globals.css`                  | No migration at all                                             | The 770-line file _is_ the defect being fixed                                                                                           | —                                                                                                                               |
| Fonts from Google Fonts / a CDN               | Zero repository weight, always current                          | A third-party request on every page of every self-hosted instance; breaks air-gapped installs                                           | Violates the self-hosting premise the whole project is built on                                                                 |
| A font package in `node_modules`              | Managed by the package manager                                  | Still has to be copied into the Docker image; adds indirection over the same bytes                                                      | Same files, more moving parts                                                                                                   |
| System fonts only                             | Nothing to vendor, nothing to license, no CLS risk              | The result is materially worse on Linux and Android than on macOS                                                                       | The one thing the brief is least willing to leave to chance                                                                     |
| Dark theme only                               | Half the palette work; the dark look can be tuned to perfection | A reader on a light system gets a dark site with no way out                                                                             | Rejected by the project owner in favour of two equal themes                                                                     |
| A theme switcher (dark default, light option) | Gives the reader the choice explicitly                          | A new stored preference, and therefore a new settings popup, its four outcomes, and its strings in 15 dictionaries                      | Not asked for; the system setting already carries the reader's answer                                                           |

## Consequences

**Easier.** A card, a button or a chip is specified once and is the same everywhere. Changing the
accent colour is one block in one file, in both themes at once. Contrast becomes checkable, because
every text colour has a name and a surface it is allowed to sit on. New components inherit the
motion vocabulary instead of inventing a duration.

**Harder.** Two themes must be verified for every screen, not one — every stage of the redesign
ends with screenshots in both. The vendored fonts add ~400 KB to the repository and a maintenance
obligation: change a family and the fallback metrics in `fonts.css` must be recomputed, or the
layout shift they exist to prevent comes back silently.

**Taken on.** The SIL Open Font License travels with the files
(`apps/web/public/fonts/*-LICENSE.txt`); deleting them is a licence violation, not tidying up.
Locales in scripts we do not ship are explicitly a fallback case and must be checked visually
rather than assumed.

**Temporary.** `tokens.css` ends with a legacy bridge mapping the old `--color-*` names onto the new
tokens, so the redesign can land page by page. It is scaffolding with an end date — it is removed
when the last `--color-*` reference goes, and the redesign is not finished while it is still there.

**If this turns out wrong.** The failure mode to watch for is components reaching past the semantic
layer for primitives; that is what would make a future theme change a rewrite instead of an edit.
It is visible with a single grep for `--n-` and `--indigo-` outside `tokens.css` and the specimen
page, which is worth running before each stage lands.
