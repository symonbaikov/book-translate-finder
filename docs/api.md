# Public API

The REST API of a BookTranslate Finder instance. All responses are JSON; request and response
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

```bash
curl 'http://localhost:3001/api/works/<workId>'
```

```json
{
  "id": "0198…",
  "originalTitle": "Мастер и Маргарита",
  "originalLanguage": "en",
  "author": "Михаил Афанасьевич Булгаков",
  "firstPublishedYear": 1966,
  "description": "*The Master and Margarita* is a novel by Mikhail Bulgakov…",
  "coverUrl": "https://covers.openlibrary.org/b/id/12947486-L.jpg",
  "translatedLanguages": ["de", "es", "it", "pl", "pt", "ru", "zh"],
  "editionCount": 30,
  "sources": ["open-library"]
}
```

`404` with body `{"status": 404, "code": "not_found", "title": "…"}` for an unknown id
(a unified error format across all endpoints).

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
      "linkCount": 1
    }
  ]
}
```

`linkCount` — how many legal links the edition has (so the client can show availability
in the list without expanding each edition).

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
