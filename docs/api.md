# Публичное API

REST API инстанса BookTranslate Finder. Все ответы — JSON; формы запросов и ответов — это
дословно Zod-схемы из [packages/contracts](../packages/contracts/src/) (они же валидируют вход
на сервере и типизируют клиент, расхождение невозможно по построению). Базовый префикс — `/api`.

Аутентификации для чтения нет — публичные эндпоинты предназначены для UI и внешних потребителей.
Rate limit: 60 запросов в минуту с клиента (превышение → `429` с заголовками `x-ratelimit-*` и
`retry-after`).

## GET /api/search

Поиск произведения по названию и автору (полнотекстовый, устойчив к опечаткам — trigram).

| Параметр | Тип    | Описание                              |
| -------- | ------ | ------------------------------------- |
| `q`      | string | Запрос, 1–200 символов. Обязательный. |
| `limit`  | int    | 1–50, по умолчанию 20.                |

Три формы ответа, различаются полем `status` (ленивое наполнение базы,
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

- `{"status": "pending", "pollAfterMs": 3000}` — в своей базе нет, фоновая синхронизация из
  источников запущена; повторите запрос через `pollAfterMs`. HTTP-статус `202`.
- `{"status": "not_found"}` — источники тоже ничего не нашли (результат кэшируется на 24 часа).

## GET /api/works/:id

Карточка произведения: языки переводов, число изданий, источники данных.

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

`404` с телом `{"status": 404, "code": "not_found", "title": "…"}` для неизвестного id
(единый формат ошибок — во всех эндпоинтах).

## GET /api/works/:id/editions

Список изданий произведения с необязательными фильтрами.

| Параметр   | Тип    | Описание                      |
| ---------- | ------ | ----------------------------- |
| `language` | string | ISO 639-1 код, например `ru`. |
| `year`     | int    | Год издания.                  |

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

`linkCount` — сколько легальных ссылок есть у издания (чтобы клиент мог показать доступность
списком, не раскрывая каждое издание).

## GET /api/editions/:id/links

Легальные ссылки издания. Каждая ссылка несёт явный `rightsStatus` — клиент никогда не должен
выводить легальность из самого факта наличия ссылки ([legal-policy.md](legal-policy.md)).

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

- `type`: `download` (только public domain / открытая лицензия из allowlist) · `buy` · `borrow`.
- `rightsStatus`: `public_domain` · `open_license` · `copyrighted` · `unknown`.

## POST /api/sync/:source

Административный эндпоинт: поставить синхронизацию произведения из источника в очередь
(выполняет её apps/worker асинхронно). Источники: `open-library`, `google-books`.

Заголовки: `X-Admin-Token: <ADMIN_TOKEN из .env>` и `Idempotency-Key: <любой уникальный ключ>`
(повтор с тем же ключом и телом вернёт сохранённый ответ с `replayed: true`, ничего не поставив
в очередь повторно).

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

- `GET /health/live` — процесс жив.
- `GET /health/ready` — жив и видит Postgres и Redis (для оркестраторов и внешних мониторингов).
