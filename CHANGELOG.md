# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Database migrations that break
backward compatibility are marked **[BREAKING MIGRATION]** — there are none so far: all migrations
are additive, updating with `docker compose pull && up -d` is safe (the `migrate` service applies
them before the API starts).

## [Unreleased]

### Changed

- The entire UI and all project documentation switched from Russian to English. Russian remains
  only where it is literal data (book titles in examples and tests, the `name_ru` column of the
  language table, seed queries in the books' original languages).
- Modernized visual design: blue primary and secondary buttons, elevated cards with soft
  shadows on a subtle page background, focus rings on inputs, refined typography — in both
  light and dark color schemes.

### Added

- Bookstore purchase links with a country filter. The reader picks the country they shop in and
  every edition's link panel offers that country's bookstores (plus worldwide ones) as ISBN
  lookups — Waterstones/Blackwell's/Bookshop.org UK for GB, Thalia/Hugendubel for DE,
  Лабиринт/Читай-город/Ozon for RU, and so on across 13 countries. Built from a static catalog of
  URL templates in the domain, so no API key and no scraping is involved (there is no open API
  that answers "who sells this ISBN in country X"). These are lookups, not stock checks — the UI
  says so plainly, since we never fetch the shops. No affiliate tags: every URL is clean, and a
  test enforces that.

- Book covers (work hero + per-edition thumbnails, from the sources' cover services) and a work
  description block on the book card; covers also shown in search results. New nullable
  `coverUrl` fields across the API and `description` on the work card (migration 0004).
- Loading skeletons: shimmering result-card stand-ins during search/background sync (with a
  pulsing-dots indicator), a route-level skeleton for the book page, and skeleton lines while an
  edition's links load. Result cards cascade in with a fade-in-up animation; all animation is
  disabled under `prefers-reduced-motion`.
- Cross-language search: a work stored under its original-language title (e.g. «Мастер и
  Маргарита») is now findable by the title of any of its translations ("Master and Margarita") —
  search matches edition titles too, backed by a new trigram index (migration 0003). Found live:
  without this, an English query looped forever in `pending` because the backfill deduplicated
  into a work the search still could not see.
- Any-script query input: a Cyrillic query now also matches romanized-stored titles («Война и
  мир» finds "Voina i mir" — Open Library stores Russian editions romanized, so the scripts
  share zero trigrams). The search adapter retries an empty result with a romanized form of the
  query; the romanization exists only on the query side and never touches natural keys.
  Verified live in Russian, English, German, and Italian.

- Open Library Lending: real "borrow from library"/"download" links from archive.org, with an
  explicit rights status on every link.
- Source priority for metadata field conflicts; data sources are visible on the book card.
- `linkCount` in `GET /api/works/:id/editions` and a "has sources" badge in the editions list.
- Human-readable language names in the UI (instead of ISO codes), an editions filter as a
  dropdown, editions sorting: those with sources first.
- `pnpm db:seed:catalog` — seeding a fresh installation with a curated core of popular books.
- Security headers on all API responses; API documentation ([docs/api.md](docs/api.md));
  CONTRIBUTING/CODE_OF_CONDUCT/issue and PR templates.

### Fixed

- **Only 87 of 183 ISO 639-1 languages were supported, and editions in the rest were silently
  dropped.** `SyncWorkFromSource` skips any edition whose language it cannot parse, so the
  "likely codes" shortcut in the language table was quiet data loss — 116 three-letter codes are
  now accepted that previously were not, including French `fra`, German `deu`, Greek `ell`, and
  Icelandic `isl` (both the bibliographic /B and terminological /T forms are mapped now).
- **Covers often missing.** Two causes: rows synced before covers existed never re-sync, and
  many edition records carry no cover of their own even when Open Library has one for their
  ISBN. Covers are now derived from the ISBN at read time, which fixes existing rows without a
  re-sync, and a work with no cover borrows one from its first edition. A derived URL is a
  guess, so a 404 now falls back to the 📖 placeholder instead of a broken-image icon.
- **Editions with only bookstore links looked empty.** They now carry an "in bookstores" badge,
  distinct from the "read or borrow" badge for editions with real source links.

- Response-cache keys are now versioned through a single `CACHE_KEY_VERSION` constant (bumped to
  `v2`). Found live: adding `coverUrl` to the editions response left pre-change entries cached,
  the use case returned them verbatim, and the controller's output validation correctly refused
  to serve them — 500s until the keys were flushed by hand. A version bump makes that
  self-healing, exactly as docs/architecture.md §6 always intended the `v1` prefix to work.

- Source HTTP client timeout raised 5s → 25s: real Open Library latency (up to 22s)
  was killing requests that would have completed successfully.
- A transient source error during background backfill no longer blocks retrying the same
  search query until the end of the day (completed jobs are retained for only 60 seconds — long
  enough for jobId deduplication to absorb the UI's 3-second poll loop, which briefly caused
  back-to-back duplicate syncs, short enough that a deliberate retry a minute later works).
- Two gaps in DB indexes found by a load test on 50k books: trigram search was not
  using the GIN index (~4x speedup), work sources lookup was doing a seq scan (~60x).

### Known issues

- `pnpm audit`: vulnerabilities in transitive dependencies of NestJS 10 / Fastify 4 / Next 14 /
  drizzle-orm 0.36; fixes require major framework upgrades — a dedicated migration task,
  not a one-off override (see docs/plan.md, Phase 3).
- The original-language detection heuristic (based on the earliest edition in the sample) can be
  wrong for classics whose early editions did not make it into the source's sample.

## [0.1.0] — 2026-08-13

First working MVP: search with lazy backfill from Open Library / Google Books,
a normalized database (Postgres), a book card with editions and legal links, self-hosting
via Docker Compose with images from GHCR.
