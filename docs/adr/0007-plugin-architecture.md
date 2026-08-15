# ADR-0007: Plugins as a leaf package, and a client that keeps the reader's locations and libraries to itself

- Status: accepted
- Date: 2026-08-14

## Context

Three features were requested together, and they turn out to share one problem.

- **OPDS catalogs.** A reader wants to browse Project Gutenberg _and_ the Calibre-Web running on
  their own network, in the same interface.
- **Bookshops nearby.** "Which shops are near me" needs coordinates.
- **Prices across shops.** Several shop integrations polled at once, each of which will break on
  its own schedule.

The shared problem is _where the code runs_. A Calibre server on `192.168.1.10:8083` is
unreachable from the API by definition; sending its URL — often with a password — to this instance
would hand over a credential we can never use and a description of someone's home network. A
device fix from the Geolocation API is accurate to a doorway; routing it through our servers turns
an aggregator into a location log. Both belong in the browser.

But `apps/web` may not import `packages/domain`, `application` or `infrastructure`
(docs/architecture.md §2.5), and `packages/domain` may not depend on anything at all (CLAUDE.md).
So the modules that must run on the reader's device had nowhere to live: putting them in
`infrastructure` makes them unusable in the browser, duplicating them in `apps/web` means two
implementations of a legal check.

A fourth pressure came from the brief itself: shop price adapters were described as parsers of
shop pages. This project forbids that outright (docs/legal-policy.md I-3) — parsing a site's HTML
instead of using its published interface is the invariant that decides everything else here.

## Decision

### 1. A new leaf package, `packages/plugins`

It depends on no other workspace package and is imported by both `apps/web` (where it is bundled
into the browser) and `packages/infrastructure` (where it runs in Node). Its `tsconfig` declares
`"types": []` so nothing Node-only can creep in. `pnpm boundaries` enforces the leaf rule
(`plugins-is-a-leaf`), and `web-no-domain-application-infrastructure` was amended to permit this
one import and no others.

It holds the plugin contract (`PluginManifest`, `PluginRegistry`, `settleAll`), the OPDS 1.2 / 2.0
parsers and client, and the OpenStreetMap bookshop lookup.

### 2. `accessMode` has no `html-scrape` member

A plugin declares how it gets its data: `official-api`, `url-template`, or `user-hosted`. There is
deliberately no way to declare "scrapes a page", so the legal invariant is visible in the type
rather than in a review comment. The shop adapters shipped here are one real price API (Google
Play, via Google Books' `saleInfo`) and ~90 deterministic ISBN-lookup URLs that are built and never
fetched.

### 3. Three fetch paths, chosen by what each catalog actually is

| Catalog                                                     | Fetched by                         | Why                                                              |
| ----------------------------------------------------------- | ---------------------------------- | ---------------------------------------------------------------- |
| Reader's own server (Calibre, COPS, Kavita, Audiobookshelf) | the browser                        | private address; the URL and password never leave the device     |
| Project Gutenberg                                           | the API, `GET /api/opds/feeds/:id` | it sends no CORS headers, so a browser physically cannot read it |
| anything else                                               | nothing                            | there is no endpoint that fetches an arbitrary URL               |

Only Project Gutenberg ships as a built-in. Standard Ebooks was intended as the second and was
removed after a live check: all of its OPDS endpoints answer `401` to an anonymous client (the
feeds are a Patrons Circle benefit), and its open Atom feed carries no acquisition links, so
shipping it would have put an empty shelf on the page. A patron can add it themselves through the
custom-catalog form, credentials and all.

The relay takes a **feed id**, not a URL. An optional `href` (pagination, a sub-catalog) must
resolve onto that feed's own origin. That is what keeps the endpoint from being an SSRF gadget:
no input makes it fetch a host the operator did not ship.

### 4. Coordinates are blurred at the source and never reach this instance

`sanitizeCoordinates` rounds to three decimals — about 110 m — before the value is used for
anything. That is a neighbourhood, not a building, and it is ample for ranking shops inside a
kilometres-wide radius. The Overpass query then goes straight from the reader's browser.

A manual "city or postcode" field sits next to the button rather than appearing after a refusal:
many people decline location prompts on principle, and a typed place name is both a good answer
and a more private one.

`GET /api/stores/nearby` exists for clients that cannot do this themselves, and is **off unless
`ENABLE_SERVER_GEO_LOOKUP=true`**. A disabled instance answers 404 rather than advertising a route
it will not serve.

### 5. The shadow-library denylist is duplicated, and a test enforces parity

The check must run in the browser when a reader adds a catalog. `apps/web` cannot import the
domain and the domain cannot import anything, so the list exists twice —
`packages/domain/src/policy/link-policy.ts` and `packages/plugins/src/opds/feed-catalog.ts` — and
`packages/plugins/test/parity/shadow-library-denylist.test.ts` fails the build if they diverge.
Duplication was chosen over a weaker check, and made loud rather than quiet.

## Consequences

**Good.** A shop redesigning its site cannot break the core; at worst one adapter's URL shape goes
stale. A reader can browse their own library server without this instance learning it exists. The
legal invariant is expressed in a type instead of a convention. One `OverpassStoreLocator`
implementation serves the browser and the (opt-in) server path, so they cannot drift.

**Costs, honestly.** The denylist is duplicated, and only a test keeps the copies honest. Feed
credentials sit in `localStorage`, which the UI states plainly rather than hides — the realistic
threat this design addresses is the credential reaching a third party, not someone reading storage
on the reader's own machine. Client-side fetching hits CORS on public catalogs, which is why the
relay exists at all, and a reader adding a public feed of their own may find their browser cannot
read it; the UI says so instead of showing a bare "Failed to fetch". And the built-in shelf is one
catalog rather than the two planned, for the reason above.

**What this does not do.** It does not make stock or price data appear where none exists.
OpenStreetMap says where a bookshop is and nothing about its shelves, so every result is
`availability: 'unknown'` with the reason attached; only Google Play publishes a price we can
read, so most shop rows say "price not published". Both are the honest answer, and the project
prefers an honest gap to a plausible invention (docs/plan.md, Phase 4).
