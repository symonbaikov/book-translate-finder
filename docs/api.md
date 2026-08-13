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
      "firstPublishedYear": 1966
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
      "linkCount": 1
    }
  ]
}
```

`linkCount` — how many legal links the edition has (so the client can show availability
in the list without expanding each edition).

## GET /api/editions/:id/links

The edition's legal links. Every link carries an explicit `rightsStatus` — the client must never
infer legality from the mere presence of a link ([legal-policy.md](legal-policy.md)).

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
  ]
}
```

- `type`: `download` (public domain / open license from the allowlist only) · `buy` · `borrow`.
- `rightsStatus`: `public_domain` · `open_license` · `copyrighted` · `unknown`.

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
