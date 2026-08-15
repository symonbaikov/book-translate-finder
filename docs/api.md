# Public API

The REST API of a Golden Library instance. All responses are JSON; request and response
shapes are literally the Zod schemas from [packages/contracts](../packages/contracts/src/) (they
also validate input on the server and type the client, so divergence is impossible by
construction). The base prefix is `/api`.

There is no authentication for reads — the public endpoints are intended for the UI and external
consumers. Rate limit: 60 requests per minute per client (exceeding it → `429` with
`x-ratelimit-*` and `retry-after` headers).

## GET /api/search

Search for a work by title and author (full-text, typo-tolerant — trigram).

| Parameter | Type   | Description                        |
| --------- | ------ | ---------------------------------- |
| `q`       | string | Query, 1–200 characters. Required. |
| `limit`   | int    | 1–50, default 20.                  |

Three response shapes, distinguished by the `status` field (lazy database backfill,
[ADR-0003](adr/0003-lazy-backfill.md)):

```bash
curl 'http://localhost:3001/api/search?q=Мастер%20и%20Маргарита%20Булгаков'
```

```json
{
  "status": "found",
  "results": [
    {
      "id": "0198…",
      "originalTitle": "Мастер и Маргарита",
      "author": "Михаил Афанасьевич Булгаков",
      "firstPublishedYear": 1966,
      "coverUrl": "https://covers.openlibrary.org/b/id/12947486-L.jpg"
    }
  ]
}
```

- `{"status": "pending", "pollAfterMs": 3000}` — not in the local database, background
  synchronization from the sources has been started; repeat the request after `pollAfterMs`.
  HTTP status `202`.
- `{"status": "not_found"}` — the sources found nothing either (the result is cached for 24 hours).

## GET /api/works/:id

Work card: translation languages, edition count, data sources.

| Parameter  | Type   | Description                                                                   |
| ---------- | ------ | ----------------------------------------------------------------------------- |
| `language` | string | ISO 639-1 code — the reader's interface language. Filters nothing; see below. |

```bash
curl 'http://localhost:3001/api/works/<workId>?language=ru'
```

```json
{
  "id": "0198…",
  "originalTitle": "Мастер и Маргарита",
  "originalLanguage": "en",
  "author": "Михаил Афанасьевич Булгаков",
  "firstPublishedYear": 1966,
  "description": "«Мастер и Маргарита» — роман Михаила Афанасьевича Булгакова…",
  "descriptionLanguage": "ru",
  "descriptionSource": {
    "name": "wikipedia",
    "url": "https://ru.wikipedia.org/wiki/Мастер_и_Маргарита"
  },
  "coverUrl": "https://covers.openlibrary.org/b/id/12947486-L.jpg",
  "translatedLanguages": ["de", "es", "it", "pl", "pt", "ru", "zh"],
  "editionCount": 30,
  "sources": ["open-library"]
}
```

`language` asks for a description written in that language. It is looked up by identifier, never
by title: the work's Open Library id → Wikidata (`P648`) → that language's Wikipedia article.
When there is no such article, `description` falls back to whatever the bibliographic source
wrote, `descriptionLanguage` is `null` (the source never states it, so the API does not guess),
and `descriptionSource` is `null`. When a localized description _is_ returned,
`descriptionSource` must be shown to the reader — Wikipedia's text is CC BY-SA, and the link is
the attribution.

`404` with body `{"status": 404, "code": "not_found", "title": "…"}` for an unknown id
(a unified error format across all endpoints).

## GET /api/featured

The home page's book lists.

| Parameter  | Type   | Description                                                         |
| ---------- | ------ | ------------------------------------------------------------------- |
| `language` | string | ISO 639-1 code — the reader's language. Adds an `in-language` list. |

```bash
curl 'http://localhost:3001/api/featured?language=ru'
```

```json
{
  "books": [
    {
      "workId": "0198…",
      "title": "Анна Каренина",
      "author": "Лев Толстой",
      "year": 1876,
      "coverUrl": "https://covers.openlibrary.org/b/id/2560652-L.jpg",
      "list": "in-language",
      "hasFreeCopy": true
    }
  ],
  "filling": true,
  "language": "ru"
}
```

Three lists, in the `list` field:

- `in-language` — books _written_ in `language`, most-published first. Not a language filter over
  the other two: asking Open Library for works with an edition in Russian returns the Bible and
  _Pride and Prejudice_, which is "world classics that also exist in Russian", not "books in
  Russian". The list comes from the literature subject for that language
  (`LITERATURE_SUBJECT_BY_LANGUAGE` in `packages/domain`), so it is absent — and `language` is
  `null` — for a language this project has no verified subject for.
- `books-of-the-year`, `popular` — the hand-curated catalogue (`featured-books-catalog.ts`).

`year` is `null` for `in-language` entries: that list is ordered by how often a book was
published, and the API does not invent a date to fill the field.

`filling: true` means some entries are still being fetched in the background (a fresh instance,
or a language nobody has asked for yet) — the list gets longer on a later request.

## GET /api/free-books

The free shelf: works this instance has at least one legal free copy of. Feeds the home page's
"free to read right now" row and the catalogue behind it (`/free` in apps/web).

| Parameter  | Type   | Description                                                               |
| ---------- | ------ | ------------------------------------------------------------------------- |
| `language` | string | ISO 639-1 code. Filters on the language of the **free edition**, not any. |
| `limit`    | int    | 1–60, default 24.                                                         |
| `offset`   | int    | ≥ 0, default 0. How the catalogue pages.                                  |

```bash
curl 'http://localhost:3001/api/free-books?limit=2&language=ru'
```

```json
{
  "books": [
    {
      "id": "0198…",
      "originalTitle": "Анна Каренина",
      "author": "Лев Толстой",
      "firstPublishedYear": 1876,
      "coverUrl": "https://covers.openlibrary.org/b/id/2560652-L.jpg",
      "formats": ["epub", "txt"]
    }
  ],
  "total": 9,
  "language": "ru",
  "limit": 2,
  "offset": 0
}
```

"Free" here means a free `download` or `listen` link: `source_link.is_legal_free` — the flag
`LinkPolicy` sets when a link is admitted and a storage CHECK re-enforces
([legal-policy.md](legal-policy.md)) — on a link type that actually hands the reader the work. The
type test is not redundant: `is_legal_free` follows from rights status alone, so a `borrow` link to
a public domain scan carries it, and a library waiting list is not what a shelf headed "free to
read right now" promises. The endpoint carries no per-book rights status because there is only one
possible answer; a work that does not qualify is simply absent.

`total` counts every work matching the filter, not just this page, so a client can page without
guessing when to stop. Ordering is by edition count, most-published first, with year, title and id
breaking ties — a total order, because `OFFSET` paging over an unstable one silently repeats some
books and hides others.

`formats` are the formats of the free copies (`epub`, `txt`, `mp3`, …), deduplicated. Empty is
common and is not an error: a public domain reading page is not a file.

Unlike the genre pages, a thin answer queues nothing. "Which books are free" is not a question any
source answers, so there is nothing honest to go and fetch; the shelf grows as ordinary syncs land
free links.

## GET /api/works/:id/editions

The work's editions list with optional filters.

| Parameter  | Type   | Description                |
| ---------- | ------ | -------------------------- |
| `language` | string | ISO 639-1 code, e.g. `ru`. |
| `year`     | int    | Publication year.          |

```json
{
  "workId": "0198…",
  "editions": [
    {
      "id": "0198…",
      "title": "Il maestro e Margherita",
      "language": "it",
      "translator": null,
      "translatedFrom": null,
      "publisher": "Feltrinelli",
      "year": 2016,
      "isbn": "9788807900143",
      "coverUrl": "https://covers.openlibrary.org/b/id/8305834-L.jpg",
      "linkCount": 1,
      "freeDownloads": [
        {
          "url": "https://www.gutenberg.org/ebooks/2600.epub.noimages",
          "format": "epub",
          "provider": "gutenberg",
          "type": "download",
          "rightsStatus": "public_domain"
        }
      ]
    }
  ]
}
```

`linkCount` — how many legal links the edition has (so the client can show availability
in the list without expanding each edition).

`freeDownloads` — the copies of _this_ edition the reader can simply take, sent with the list
rather than only through `GET /api/editions/:id/links`, so a client can put them first and offer
the link without a second request. Empty for almost every edition, and at most four per edition
(the rest stay in the links endpoint).

Only `download` and `listen` links appear here, and only free ones. Not every `isLegalFree` link
qualifies: that flag follows from rights status alone, so a `borrow` link to a public domain scan
carries it while being a waiting list rather than a copy. `rightsStatus` is stated on every entry
anyway — a client must never conclude "this must be legal, it was in the free list"
([legal-policy.md](legal-policy.md)).

## GET /api/editions/:id/links

Legal links for the edition. Every link carries an explicit `rightsStatus` — the client must
never infer legality from the mere existence of a link ([legal-policy.md](legal-policy.md)).

| Parameter | Type   | Description                                                      |
| --------- | ------ | ---------------------------------------------------------------- |
| `country` | string | ISO 3166-1 alpha-2. Selects which bookstores to offer. Optional. |

The response has two separate lists. `links` are links **discovered from sources** (downloads,
library lending). `bookstores` are ISBN **lookups** in shops serving `country` (plus worldwide
ones), built from a static catalog of URL templates — see
[bookstore-catalog.ts](../packages/domain/src/policy/bookstore-catalog.ts). We never fetch those
shops, so a bookstore entry is **not** a stock or price check: it is a link to the shop's own
search for that ISBN. Editions without an ISBN return an empty `bookstores` list.

```bash
curl 'http://localhost:3001/api/editions/<editionId>/links?country=GB'
```

```json
{
  "editionId": "0198…",
  "links": [
    {
      "type": "borrow",
      "provider": "internet-archive",
      "rightsStatus": "copyrighted",
      "url": "https://openlibrary.org/books/OL…/borrow"
    }
  ],
  "bookstores": [
    {
      "type": "buy",
      "provider": "waterstones",
      "providerName": "Waterstones",
      "rightsStatus": "copyrighted",
      "url": "https://www.waterstones.com/books/search/term/9780140447934"
    }
  ]
}
```

- `type`: `download` (public domain / open license from the allowlist only) · `buy` · `borrow`.
- `rightsStatus`: `public_domain` · `open_license` · `copyrighted` · `unknown`.
- `format`: for downloads, the file format the link actually yields (`epub`, `mobi`, `txt`,
  `html`, `pdf`); `null` for buy/borrow links, which land on a page rather than a file. Project
  Gutenberg supplies several formats for the same public domain book, so an edition can
  legitimately carry one download link per format.

## GET /api/editions/:id/prices

Every shop that can be reached for this edition, grouped by binding
([ADR-0007](adr/0007-plugin-architecture.md), Module C).

| Parameter | Type   | Description                                                 |
| --------- | ------ | ----------------------------------------------------------- |
| `country` | string | ISO 3166-1 alpha-2. Decides which shops are offered at all. |

Two things about this response are deliberate and worth knowing before you build against it.

**`amountMinor` is nullable and there is no default.** Only Google Play publishes a price through
an open API, so most offers carry `null` — meaning _this shop does not publish a price_, never
"free" and never zero. The project shows what a source states and does not invent the rest
([plan.md](plan.md) 4.10). Amounts are integers of minor units (cents), and prices are **never**
converted between currencies: there is no exchange rate here, and a converted price is not the
price anyone will be charged.

**`degraded` is part of a successful response.** A shop that timed out is named there rather than
quietly dropped, because a shorter list that looks complete is the misleading outcome. A partial
answer is cached for 60 seconds instead of the usual 15 minutes, so a brief outage does not freeze
an incomplete list for a quarter of an hour.

```bash
curl 'http://localhost:3001/api/editions/<editionId>/prices?country=DE'
```

```json
{
  "editionId": "0198…",
  "groups": [
    {
      "format": "paperback",
      "offers": [
        {
          "providerId": "thalia",
          "providerName": "Thalia",
          "format": "paperback",
          "amountMinor": null,
          "amount": null,
          "currency": null,
          "url": "https://www.thalia.de/suche?sq=9780140447934",
          "availability": "unknown",
          "note": "Shop in your country"
        }
      ]
    },
    {
      "format": "ebook",
      "offers": [
        {
          "providerId": "google-play-books",
          "providerName": "Google Play Books",
          "format": "ebook",
          "amountMinor": 999,
          "amount": 9.99,
          "currency": "EUR",
          "url": "https://play.google.com/store/books/details?id=…",
          "availability": "available",
          "note": "Google Play, DE"
        }
      ]
    }
  ],
  "degraded": [],
  "retrievedAt": "2026-08-14T10:00:00.000Z"
}
```

- `format`: `hardcover` · `paperback` · `ebook` · `audiobook` · `unknown`. Sources word bindings in
  a dozen ways per language; unrecognized ones stay `unknown` rather than being forced into the
  nearest bucket.
- `availability`: `available` · `unavailable` · `unknown`. The URL-template shops are always
  `unknown` — we never fetch their pages, so we cannot know.

## GET /api/opds/feeds

The OPDS catalogs shipped with this instance. A reader's own catalogs never appear here: those live
in their browser and are fetched from it ([ADR-0007](adr/0007-plugin-architecture.md), Module A).

```json
{
  "feeds": [
    {
      "id": "gutenberg",
      "name": "Project Gutenberg",
      "runtime": "server",
      "accessMode": "official-api",
      "homepage": "https://www.gutenberg.org"
    }
  ]
}
```

## GET /api/opds/feeds/:id

One page of a shipped catalog, parsed from OPDS 1.2 (Atom) or 2.0 (JSON) into one normalized shape.

| Parameter | Type   | Description                                                                      |
| --------- | ------ | -------------------------------------------------------------------------------- |
| `href`    | string | A link from a feed this endpoint returned earlier — pagination or a sub-catalog. |

**This is not a URL proxy.** It takes a registered feed **id**, and `href` is rejected unless it
resolves onto that feed's own origin. There is no input that makes it fetch a host the operator did
not ship. It exists only because Project Gutenberg sends no CORS headers, so a browser cannot read
it directly.

Each entry's `acquisitions` describe how the reader can actually obtain the file: `kind`
(`open-access`, `buy`, `borrow`, `subscribe`, `sample`, `unspecified`), the media type and a
reader-facing `formatLabel` (`EPUB`, `PDF`, `FB2`), plus `requiresDrmApp` when the link yields a
DRM licence rather than the book. A client must not render anything but a free, DRM-free,
unpriced acquisition as a plain download.

## GET /api/stores/nearby

Bookshops near a point. **Disabled unless `ENABLE_SERVER_GEO_LOOKUP=true`** — a disabled instance
answers `404` rather than advertising a route it will not serve.

The web app does not use this. It runs the same OpenStreetMap lookup in the reader's browser so
their coordinates never reach the instance ([ADR-0007](adr/0007-plugin-architecture.md), Module B).
This endpoint is for clients that cannot do that.

| Parameter  | Type   | Description                                          |
| ---------- | ------ | ---------------------------------------------------- |
| `lat`      | number | −90…90. Rounded to ~110 m before any outbound query. |
| `lng`      | number | −180…180.                                            |
| `radiusKm` | number | 0.5…50, default 5.                                   |
| `isbn`     | string | Optional. Passed to adapters that can match on it.   |

`availability` is `unknown` for every result the shipped adapter returns, and `availabilityNote`
says why: OpenStreetMap knows where a bookshop is, and no open dataset publishes what one has in
stock. The answer is "bookshops near you", never "has this book".

## POST /api/sync/:source

Administrative endpoint: enqueue synchronization of a work from a source
(apps/worker executes it asynchronously). Sources: `open-library`, `google-books`.

Headers: `X-Admin-Token: <ADMIN_TOKEN from .env>` and `Idempotency-Key: <any unique key>`
(a repeat with the same key and body returns the stored response with `replayed: true`, without
enqueueing anything again).

```bash
curl -X POST 'http://localhost:3001/api/sync/open-library' \
  -H 'Content-Type: application/json' \
  -H "X-Admin-Token: $ADMIN_TOKEN" \
  -H 'Idempotency-Key: my-unique-key-1' \
  -d '{"query": "The Hobbit Tolkien"}'
```

```json
{ "status": "queued", "jobId": "sync-open-library-…", "replayed": false }
```

## Health

- `GET /health/live` — the process is alive.
- `GET /health/ready` — alive and can see Postgres and Redis (for orchestrators and external monitoring).

## Accounts and bookmarks

All of these use a session cookie (`btf_session`), which is HttpOnly, SameSite=Lax, and marked
`Secure` only when `PUBLIC_URL` is https — a `Secure` cookie is never sent over plain http, which
would silently sign everyone out on a local run.

| Method   | Path                        | Notes                                                                                                                                                     |
| -------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`    | `/api/auth/me`              | Current user or `null`, plus `googleEnabled` for this instance                                                                                            |
| `POST`   | `/api/auth/register`        | `{email, password, displayName?}` — 409 if the address is taken                                                                                           |
| `POST`   | `/api/auth/login`           | `{email, password}` — 400 with one message for both "no such account" and "wrong password", so it cannot be used to test whether an address is registered |
| `POST`   | `/api/auth/logout`          | Ends the session server-side and clears the cookie                                                                                                        |
| `GET`    | `/api/auth/google/start`    | Redirects to Google. 400 when the instance has no Google credentials                                                                                      |
| `GET`    | `/api/auth/google/callback` | Redirects back to the web app; failures land on `/login?error=…`                                                                                          |
| `GET`    | `/api/bookmarks`            | The reader's saved works, newest first. 401 when signed out                                                                                               |
| `POST`   | `/api/bookmarks/:workId`    | Idempotent — saving twice yields one bookmark                                                                                                             |
| `DELETE` | `/api/bookmarks/:workId`    | Removing something already gone is a success, not a 404                                                                                                   |
