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

- **A logo.** Original 16×16 pixel art — an open book with a ribbon — in the site header, as the
  favicon, and at the top of the README. Drawn for this project rather than borrowed, so a fork
  inherits a mark it is allowed to use; swapping in your own is one file and one line
  ([docs/images/README.md](docs/images/README.md)).

- **Personal recommendations on the home page**, from the books you open — and computed without a
  profile. The reading history stays in your browser; the server is sent a list of genres and
  never learns whose they are, so the "no profile, no tracking" promise on the sign-in page stays
  true and the feature works for signed-out readers with no identifier at all. Each suggestion
  names the genre it shares with what you have been reading, and there is a "forget my history"
  link that really deletes it, because there is only one copy. See
  [ADR-0006](docs/adr/0006-local-recommendations.md).

- **Genre tags are links.** Clicking one opens a catalogue of every book this instance knows under
  that tag. If the reader already picked a book language, that choice carries over automatically
  and the page says which filter is in effect, with one click to drop it — asking again for
  something already answered is what makes a site feel like a form.
- **"Books of the year" is grouped by year**, because the year is the organising idea of that
  list; a wall of covers with the year in small print does not answer "what came out in 2023".
- The home page headline is now **"Find your next magnum opus"**, translated in all 15 languages.

### Fixed

- **The home page showed three books instead of seventeen.** Curated entries were matched to the
  database by exact natural key, so _James_ never matched because Open Library files it under
  "Percival L. Everett" rather than "Percival Everett". Matching is now fuzzy on the author and
  exact on the title — loosening both would have put "Summary of Hamnet by Maggie O'Farrell", a
  study guide by a different author, on the home page under the novel's name. The list also
  re-checks every minute while it is still filling instead of caching a short list for half an
  hour, and queues twice as many missing books per request.

- **The interface speaks 15 languages.** A selector in the header, defaulting to English:
  English, Русский, Українська, Deutsch, Français, Español, Português, Italiano, Nederlands,
  Polski, Türkçe, العربية, 日本語, 中文, 한국어. Arabic renders right-to-left. The choice lives in a
  cookie so server-rendered pages arrive already translated rather than flashing English first.
  Only languages with a complete dictionary are listed — a language in the menu is a promise the
  page will be in that language. Adding one is a single file plus one line
  (`apps/web/src/i18n/README.md`), and TypeScript refuses to compile a dictionary missing a key.
- **Audiobooks.** LibriVox joins the sources: public domain recordings with a per-book MP3 archive
  to keep and a page to listen on, shown as a new `listen` link type held to exactly the same
  legal bar as a download (ADR-0005). Editions carry their running time — "Audiobook, 13:06:44".
- **A curated home page.** "Books of the year" and "Widely read, widely translated", resolved
  against whatever this instance knows and filled in lazily in the background for the rest, so a
  fresh install populates itself over the first few minutes instead of showing an empty page. It
  is an editorial list, and says so: no open source publishes a sales ranking.

- **Accounts and saved books.** Sign in with an email and password, or with Google where the
  instance is configured for it, and keep the books you find. Saving is idempotent by
  `(user, work)`, so a double click or a retried request cannot produce two entries. Sessions are
  server-side and opaque, so signing out really ends them.
  - Google sign-in appears only when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are both set —
    a `docker compose up` instance with neither simply offers email and password.
  - The welcome email is sent only when `SMTP_URL` is set, and a failure to send never blocks
    registration: a self-hosted instance must work without mail credentials.
  - Passwords are scrypt-hashed with `node:crypto` — no native addon, so `pnpm install` keeps
    working everywhere. Session tokens are stored only as SHA-256.
  - A soft invitation to sign in appears under search results, once there is something worth
    keeping. Nothing on the site requires an account.

- **A footer that says what this is.** The GitHub mark, "Open source — MIT licensed,
  self-hostable", and a link to the repository. The mark is inlined SVG: the page must stay
  renderable with no third-party requests.
- **Bookshops grouped by why they are offered.** The country picked in settings gets its own
  heading ("In Germany"), then the markets where the edition's language is sold ("Where Arabic
  books are sold"), then the shops that ship worldwide. The reader's choice is now visibly their
  choice instead of being blended into one anonymous list.

- **Free copies the author or publisher gives away.** A fourth answer to "where do I get this
  book", alongside public domain, borrow and buy: a hand-curated catalog of books still under
  copyright whose rights holder publishes them for free (Cory Doctorow's novels, Peter Watts',
  _Pro Git_). Each entry names the page where the permission is granted and the date a human last
  read it; links are `open_license`, never `public_domain`. Adding a book is a one-entry PR — see
  CONTRIBUTING.md and [ADR-0004](docs/adr/0004-authorized-free-catalog.md).

### Fixed

- **The same book could split into two cards.** Open Library sometimes lists an author twice
  (`["Peter Watts", "Peter Watts"]`), which produced the author line "Peter Watts, Peter Watts" —
  a different natural key from every other source's "Peter Watts". The book then existed twice:
  one card with the editions, one with the download links. Repeated authors are now collapsed.
- **A stale `external_ref` failed an entire sync** with "Cannot read properties of null (reading
  'id')". Two lookups assumed a row must exist because a pointer to it did; a missing row is now
  treated as "create it".

- **Bookstores in 47 countries, up from 13.** ~90 retailers, every ISBN-lookup URL checked live
  before being added; a shop whose URL shape could not be confirmed was left out rather than
  guessed at. The country selector now names countries via the platform's own `Intl.DisplayNames`
  instead of a hand-maintained table.

### Fixed

- **A book's translations were being silently truncated.** `editions.json` was read one page deep,
  so a work with 536 editions contributed 50 — and since Open Library returns editions in no
  meaningful order, that page is mostly English reprints. The provider now walks every page,
  trusting the response's own `size` rather than "a short page means the last page" (Open Library
  was observed serving 50 entries for a `limit=500` request). Measured on real data: _1984_ went
  from 48 editions / 10 languages to 344 / 22, _The Little Prince_ from 54 / 8 to 447 / 31.

- **Real download links, per format.** A third source — Project Gutenberg, via the key-free
  Gutendex API — supplies actual downloadable files for public domain books: EPUB, MOBI, plain
  text and HTML, each a separate link labeled with its format ("Download EPUB"). Verified live:
  War and Peace resolves to a real 1.8 MB EPUB. An edition can now carry several links, and
  Gutenberg runs as an _enrichment_ source — even when another source already found the work —
  so a public domain book never shows only borrow links when the file is freely available.

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
