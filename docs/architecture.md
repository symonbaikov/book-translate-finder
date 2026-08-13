# Архитектура BookTranslate Finder

Документ описывает целевую архитектуру системы. Он нормативный: код должен соответствовать
описанному здесь разделению слоёв и контрактам. Отклонения оформляются через ADR в `docs/adr/`.

---

## 1. Контекст и границы системы

```
        ┌──────────────┐
        │  Пользователь │
        └──────┬───────┘
               │ HTTPS
     ┌─────────▼──────────┐
     │  Web (Next.js)     │  SSR карточки книги, поиск, SEO
     └─────────┬──────────┘
               │ REST (JSON, contracts)
     ┌─────────▼──────────┐        ┌──────────────┐
     │  API (NestJS)      │◄──────►│    Redis     │ кэш, rate limit, очереди
     └─────────┬──────────┘        └──────▲───────┘
               │                          │
     ┌─────────▼──────────┐        ┌──────┴───────┐
     │   PostgreSQL       │        │   Worker     │ BullMQ: синхронизация, импорт
     └────────────────────┘        └──────┬───────┘
                                          │ HTTP (rate-limited, retry, circuit breaker)
                           ┌──────────────▼───────────────┐
                           │ Внешние источники:            │
                           │ Open Library, Google Books,   │
                           │ WorldCat, Index Translationum,│
                           │ Gutenberg / Internet Archive  │
                           └───────────────────────────────┘
```

Ключевое свойство: **пользовательский запрос никогда не идёт синхронно во внешний API**.
Внешние источники опрашиваются воркерами асинхронно, результат нормализуется и кладётся в
PostgreSQL; чтение идёт из своей БД с прогревом через Redis. Единственное исключение —
Фаза 0 (прототип), которая существует ровно для проверки гипотезы и затем выбрасывается.

---

## 2. Слои Clean Architecture

### 2.1 Правило зависимостей

Зависимости направлены **только внутрь**. Внутренний слой ничего не знает о внешнем.

```
   apps (web / api / worker)          ← composition root, HTTP, DI, cron
        ↓
   infrastructure                     ← адаптеры: Postgres, Redis, HTTP-клиенты, BullMQ
        ↓
   application                        ← use cases (интеракторы), оркестрация
        ↓
   domain                             ← сущности, VO, доменные правила, ПОРТЫ (интерфейсы)
```

`packages/contracts` — поперечный пакет с Zod-схемами внешнего API; его импортируют `apps/web`
и `apps/api`, но **не** `domain` и не `application`.

Правило проверяется автоматически в CI командой `pnpm boundaries` (dependency-cruiser,
`.dependency-cruiser.mjs`), а не силой воли ревьюера — она резолвит импорты пакетов
(`@btf/infrastructure` и т.п.) до реальных файлов и падает на любом нарушении направления
зависимостей. `eslint-plugin-boundaries` был опробован для этой роли на этапе 1.0, но в связке
pnpm + ESM + TS project references не резолвил `@btf/*`-импорты между пакетами и молча
пропускал нарушения — от него отказались (docs/adr/0001-clean-architecture-monorepo.md).

### 2.2 domain (`packages/domain`)

Ноль внешних зависимостей — ни ORM, ни HTTP, ни `node:fs`, ни фреймворка. Только TypeScript.

Содержит:

- **Сущности**: `Work`, `Edition`, `SourceLink`, `Language`.
- **Value objects**: `Isbn`, `LanguageCode` (ISO 639-1), `WorkNaturalKey`, `RightsStatus`,
  `LinkType`, `ProviderId`, `ExternalRef`.
- **Доменные правила**: политика ссылок (`LinkPolicy`), нормализация названий/авторов,
  правила слияния изданий.
- **Порты** (интерфейсы, реализуемые в infrastructure).

Пример границы — порт источника метаданных:

```ts
// packages/domain/src/ports/book-metadata-provider.port.ts
export interface BookMetadataProvider {
  readonly id: ProviderId;
  searchWorks(query: SearchQuery): Promise<ProviderWork[]>;
  fetchEditions(ref: ExternalRef): Promise<ProviderEdition[]>;
}
```

Реестр портов:

| Порт                    | Ответственность                               | Реализация (Фаза 1)                          |
| ----------------------- | --------------------------------------------- | -------------------------------------------- |
| `BookMetadataProvider`  | Получение работ/изданий из внешнего источника | `OpenLibraryProvider`, `GoogleBooksProvider` |
| `WorkRepository`        | Чтение/запись `work`, поиск по natural key    | `PgWorkRepository`                           |
| `EditionRepository`     | Чтение/запись `edition`, дедупликация         | `PgEditionRepository`                        |
| `SourceLinkRepository`  | Ссылки издания                                | `PgSourceLinkRepository`                     |
| `ExternalRefRepository` | Связь «наш id ↔ id источника»                 | `PgExternalRefRepository`                    |
| `SyncLogRepository`     | Журнал синхронизаций                          | `PgSyncLogRepository`                        |
| `IdempotencyStore`      | Хранение ключей идемпотентности и ответов     | `PgIdempotencyStore`                         |
| `UnitOfWork`            | Транзакционная граница use case               | `PgUnitOfWork`                               |
| `CachePort`             | Кэш горячих запросов                          | `RedisCache`                                 |
| `JobQueuePort`          | Постановка задач синхронизации                | `BullMqQueue`                                |
| `Clock`                 | Текущее время (детерминизм тестов)            | `SystemClock`                                |
| `IdGenerator`           | Генерация id (UUIDv7)                         | `Uuid7Generator`                             |

`Clock` и `IdGenerator` — порты не ради догмы: без них use case недетерминирован, а
идемпотентность невозможно протестировать.

### 2.3 application (`packages/application`)

Use cases — по одному классу на сценарий, один публичный метод `execute`. Зависимости приходят
через конструктор в виде **портов**, никогда в виде конкретных классов.

| Use case             | Триггер                       | Идемпотентность                        |
| -------------------- | ----------------------------- | -------------------------------------- |
| `SearchWorks`        | `GET /api/search`             | Чтение, N/A                            |
| `GetWorkCard`        | `GET /api/works/:id`          | Чтение, N/A                            |
| `ListEditions`       | `GET /api/works/:id/editions` | Чтение, N/A                            |
| `GetEditionLinks`    | `GET /api/editions/:id/links` | Чтение, N/A                            |
| `EnqueueSourceSync`  | `POST /api/sync/:source`      | Ключ идемпотентности + дедуп jobId     |
| `SyncWorkFromSource` | BullMQ job                    | Upsert по natural key + external ref   |
| `ImportSourceDump`   | CLI / cron (Фаза 2)           | Батчевый upsert, чекпоинты по строкам  |
| `RefreshStaleWorks`  | cron                          | Отбор по `synced_at`, повтор безопасен |

Use case **не** знает про HTTP-статусы, Nest-декораторы, SQL и Redis. Он возвращает результат
или доменную ошибку; перевод в HTTP — работа контроллера в `apps/api`.

### 2.4 infrastructure (`packages/infrastructure`)

Адаптеры портов. Здесь и только здесь живут: Drizzle-схемы и SQL, Redis-клиент, HTTP-клиенты
источников (с таймаутами, ретраями с экспоненциальной задержкой и джиттером, circuit breaker,
уважением rate limit источника), BullMQ, маппинг «строка БД ↔ доменная сущность».

Правило маппинга: типы ORM/DTO источников **не покидают** infrastructure. Наружу отдаются
доменные сущности.

### 2.5 apps

- **`apps/api`** — composition root: сборка DI-контейнера Nest (провайдеры биндят порты на
  адаптеры), контроллеры, валидация входа Zod-схемами из `contracts`, rate limiting,
  обработка ошибок, OpenAPI.
- **`apps/worker`** — composition root воркеров: подписка BullMQ на очереди, расписания cron,
  graceful shutdown.
- **`apps/web`** — Next.js. Ходит только в собственный API. Не знает про источники данных и не
  содержит бизнес-правил, кроме отображения.

---

## 3. Модель данных

Ядро — разделение **произведения** (`work`) и **издания** (`edition`): у одной книги бывает
несколько переводов на один и тот же язык от разных издательств и переводчиков.

```
work 1───* edition 1───* source_link
 │              │
 │              └── language (ISO 639-1)
 └───* external_ref (work|edition ↔ id во внешнем источнике)
```

### 3.1 Таблицы

| Таблица           | Ключевые поля                                                                                                       | Комментарий                                                                                                                                                                                                                                                                                                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `work`            | `id`, `original_title`, `original_language`, `author`, `first_published_year`, `natural_key`, `synced_at`           | `natural_key` — детерминированный хэш нормализованных title+author                                                                                                                                                                                                                                                                                                                           |
| `edition`         | `id`, `work_id`, `title`, `language`, `translator`, `translated_from`, `publisher`, `year`, `isbn13`, `natural_key` | `natural_key` = ISBN-13, если есть; иначе хэш(work_id, language, publisher, year, norm(title)). `translated_from` — язык оригинала для этого издания; по данным Фазы 0 заполнен чаще, чем `translator` (16.4% против 12.2% изданий) — самостоятельный сигнал «это перевод», не производный от переводчика. Источник издания — через `external_ref`, отдельного поля на самой записи не нужно |
| `source_link`     | `id`, `edition_id`, `type`, `url`, `url_hash`, `provider`, `rights_status`, `is_legal_free`, `verified_at`          | `type ∈ {download, buy, borrow}`                                                                                                                                                                                                                                                                                                                                                             |
| `language`        | `code` (ISO 639-1), `name_ru`, `name_en`                                                                            | Справочник, сидируется                                                                                                                                                                                                                                                                                                                                                                       |
| `external_ref`    | `id`, `source_name`, `external_id`, `entity_type`, `entity_id`                                                      | Уникальность `(source_name, external_id)` — основа идемпотентного связывания                                                                                                                                                                                                                                                                                                                 |
| `sync_log`        | `id`, `source_name`, `work_id`, `fetched_at`, `status`, `error`, `job_id`                                           | Аудит и наблюдаемость синхронизаций                                                                                                                                                                                                                                                                                                                                                          |
| `idempotency_key` | `key`, `endpoint`, `request_hash`, `response_body`, `status_code`, `created_at`, `expires_at`                       | Идемпотентность мутирующих HTTP-эндпоинтов                                                                                                                                                                                                                                                                                                                                                   |

### 3.2 Уникальные ограничения (несущая конструкция идемпотентности)

```sql
UNIQUE (work.natural_key)
UNIQUE (edition.natural_key)
UNIQUE (external_ref.source_name, external_ref.external_id)
UNIQUE (source_link.edition_id, source_link.provider, source_link.type, source_link.url_hash)
UNIQUE (idempotency_key.key, idempotency_key.endpoint)
```

Каждая запись из источника проходит через `ON CONFLICT ... DO UPDATE`, поэтому повторный
прогон синхронизации не создаёт дублей — это свойство схемы, а не аккуратности кода.

### 3.3 Индексы (минимум для Фазы 1)

- `work`: GIN trigram по `original_title` и `author` для нечёткого поиска; btree по `synced_at`
  для отбора устаревших записей.
- `edition`: btree `(work_id, language)`, unique `isbn13` (partial, `WHERE isbn13 IS NOT NULL`).
- `source_link`: btree `edition_id`.
- `sync_log`: btree `(source_name, fetched_at DESC)`.

---

## 4. Внешний API

Базовый префикс `/api`. Все ответы — JSON, схемы описаны в `packages/contracts` и
экспортируются в OpenAPI.

| Маршрут                                       | Назначение                                    | Кэш               |
| --------------------------------------------- | --------------------------------------------- | ----------------- |
| `GET /api/search?q=&limit=`                   | Поиск произведений по названию/автору         | Redis, TTL 10 мин |
| `GET /api/works/:id`                          | Карточка: языки переводов, сводка изданий     | Redis, TTL 1 ч    |
| `GET /api/works/:id/editions?language=&year=` | Издания с фильтрами                           | Redis, TTL 1 ч    |
| `GET /api/editions/:id/links`                 | Ссылки: скачать / купить / взять в библиотеке | Redis, TTL 6 ч    |
| `POST /api/sync/:source`                      | Служебный запуск синхронизации источника      | —                 |

`POST /api/sync/:source` требует заголовок `Idempotency-Key` и служебной авторизации
(`X-Admin-Token` в Фазе 1, полноценная авторизация — Фаза 2). Повтор с тем же ключом и тем же
телом возвращает сохранённый ответ и не ставит новую задачу; повтор с тем же ключом и другим
телом → `409 Conflict`.

Ответ `GET /api/editions/:id/links` всегда содержит явный правовой статус каждой ссылки —
это требование продукта и юридической политики одновременно:

```json
{
  "editionId": "…",
  "links": [
    { "type": "download", "provider": "gutenberg", "rightsStatus": "public_domain", "url": "…" },
    { "type": "buy", "provider": "google-books", "rightsStatus": "copyrighted", "url": "…" },
    { "type": "borrow", "provider": "openlibrary", "rightsStatus": "copyrighted", "url": "…" }
  ]
}
```

---

## 5. Поток синхронизации

```
POST /api/sync/:source  ──► EnqueueSourceSync ──► BullMQ (jobId = source-target-bucket)
                                                        │
                cron RefreshStaleWorks ──────────────────┤
                                                        ▼
                                              SyncWorkFromSource
                                                        │
                    ┌───────────────────────────────────┼───────────────────────────┐
                    ▼                                   ▼                           ▼
          BookMetadataProvider              нормализация + natural key      LinkPolicy (фильтр)
          (HTTP, retry, breaker)            дедупликация изданий            легальности ссылок
                    └───────────────────────────────────┬───────────────────────────┘
                                                        ▼
                                    UnitOfWork: upsert work/edition/source_link/external_ref
                                                        ▼
                                              sync_log + инвалидация кэша
```

Свойства потока:

- **At-least-once**: очередь может доставить задачу повторно — обработчик обязан быть идемпотентным.
- **Транзакционность**: все записи одной задачи в одной транзакции через `UnitOfWork`;
  частично применённой синхронизации не существует.
- **Изоляция источников**: падение или лимит одного провайдера не блокирует остальные
  (отдельные очереди и circuit breaker на провайдер).
- **Приоритет источников**: при конфликте значений полей выигрывает источник с более высоким
  приоритетом (`open-library > google-books` для языков/изданий, обратный порядок для обложек);
  правило живёт в domain, а не в адаптере.

---

## 6. Кэширование

Два уровня:

1. **PostgreSQL** — источник истины. Данные уже нормализованы, внешние API не нужны для ответа.
2. **Redis** — кэш горячих ответов, ключ = `v1:{route}:{хэш нормализованных параметров}`.

Инвалидация — явная: успешная синхронизация работы удаляет ключи по её `work_id`. Версия `v1`
в префиксе позволяет инвалидировать всё сразу при изменении формата ответа.

Целевые показатели (из критериев успеха): холодный кэш ≤ 2 с, тёплый ≤ 300 мс.

---

## 7. Наблюдаемость

- **Логи**: structured JSON (pino), обязательный `correlationId`, сквозной от HTTP-запроса до
  задачи в очереди.
- **Метрики** (Prometheus, Фаза 3, инструментируется с Фазы 1): латентность эндпоинтов,
  hit-rate кэша, длина очередей, число ошибок и остаток лимитов по каждому внешнему источнику,
  возраст самых устаревших записей.
- **Health**: `/health/live`, `/health/ready` (готовность = доступны Postgres и Redis).

---

## 8. Зафиксированные технологические решения

| Решение                     | Причина                                                                                      |
| --------------------------- | -------------------------------------------------------------------------------------------- |
| Монорепо на pnpm workspaces | Слои Clean Architecture как отдельные пакеты с проверяемыми границами импорта                |
| NestJS на Fastify           | DI из коробки для composition root; Fastify — производительность                             |
| Drizzle ORM вместо Prisma   | SQL-first: `ON CONFLICT DO UPDATE` пишется явно, а сгенерированные типы не протекают в домен |
| BullMQ                      | Штатная дедупликация по `jobId`, ретраи, расписания; Redis уже в стеке                       |
| Zod в `contracts`           | Одна схема как валидация входа API и типы клиента                                            |
| UUIDv7 для id               | Сортируемость по времени без раскрытия последовательности                                    |

Каждое решение при пересмотре оформляется как ADR (`docs/adr/NNNN-*.md`).

---

## 9. Развёртывание и self-hosting

Self-hosting — **целевой сценарий использования**, а не побочный эффект контейнеризации.
Проект открытый, и запуск своей копии должен быть доступен человеку с одним сервером или
домашним NAS. Из этого следуют требования ниже.

### 9.1 Топология compose

Корневой `docker-compose.yml` — для self-host: тянет готовые образы, ничего не собирает.
`docker/docker-compose.dev.yml` — для разработки: собирает из исходников, только Postgres и Redis.

```
docker-compose.yml
├── postgres    healthcheck: pg_isready              volume: pgdata
├── redis       healthcheck: redis-cli ping          volume: redisdata
├── migrate     one-shot, depends_on: postgres healthy
├── api         depends_on: migrate completed_successfully, healthcheck /health/ready
├── worker      depends_on: migrate completed_successfully
├── web         depends_on: api healthy
└── caddy       профиль `tls` — опциональный reverse proxy с Let's Encrypt
```

Ключевые свойства:

- **Миграции — отдельный one-shot сервис**, а не шаг в entrypoint приложения. Запуск миграций
  из нескольких реплик api одновременно — гонка; выделенный сервис снимает вопрос.
  `api` и `worker` стартуют через `depends_on: { migrate: { condition: service_completed_successfully } }`.
- **Healthcheck у каждого сервиса.** Без них `depends_on` гарантирует только запуск процесса,
  а не готовность.
- **Именованные volume** для данных Postgres и Redis; `docker compose down` не уничтожает базу.
- **Образы с пиннутым тегом** (`:1.2.3`), не `:latest` — иначе `docker compose pull` может
  внезапно приехать с несовместимой миграцией.
- **Multi-arch сборка** (`linux/amd64`, `linux/arm64`) — чтобы работало на ARM-серверах и
  домашних машинах.
- **Непривилегированный пользователь** в контейнерах, read-only rootfs где возможно.
- Единственный обязательный к правке файл у пользователя — `.env` (копируется из `.env.example`).

### 9.2 Конфигурация self-host инсталляции

Полный и всегда актуальный список переменных — в [`.env.example`](../.env.example) (каждая
задокументирована прямо там); таблица ниже — только те, что несут архитектурный смысл.

| Переменная                   | Обязательна | Комментарий                                                                                          |
| ---------------------------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| `DATABASE_URL` / `REDIS_URL` | да          | В self-host compose (Фаза 1.6) указывают на сервисы `postgres`/`redis` внутри той же docker-сети     |
| `ADMIN_TOKEN`                | да          | Доступ к `POST /api/sync/:source`                                                                    |
| `PUBLIC_URL`                 | да          | Для корректных SSR-ссылок и CORS у `apps/api`                                                        |
| `NEXT_PUBLIC_API_URL`        | да          | Куда `apps/web` шлёт запросы к API — должен быть доступен из браузера, не только изнутри docker-сети |
| `GOOGLE_BOOKS_API_KEY`       | нет         | Без ключа работает, но с низкими лимитами                                                            |
| `WORLDCAT_API_KEY`           | нет         | Фаза 2, у большинства self-host инсталляций его не будет                                             |
| `CONTACT_URL`                | да          | Уходит в `User-Agent` запросов к источникам — этикет публичных API                                   |

Конфиг валидируется Zod-схемой при старте: инсталляция с неверным `.env` падает сразу с
внятным сообщением, а не через десять минут на первом запросе.

Отсутствие ключей платных/учрежденческих источников — штатная ситуация: соответствующие
провайдеры просто не регистрируются в composition root, система работает на оставшихся.

### 9.3 Холодная база (ключевая проблема self-hosting)

Свежая инсталляция имеет пустой Postgres. Синхронизация по расписанию наполняет только то,
что уже известно системе, — то есть ничего. Без решения пользователь увидит пустой поиск и
удалит контейнер.

Решение — **ленивое наполнение по запросу** (см. [ADR-0003](adr/0003-lazy-backfill.md)):

```
GET /api/search?q=…
   └─ есть в БД ──────────────────► 200 + результаты (при устаревших данных — фоновое обновление)
   └─ нет в БД ──► EnqueueSearchBackfill ──► 202 { status: "pending", pollAfterMs }
                                              │  UI показывает «ищем в источниках…»
                                              ▼
                                    воркер опрашивает провайдеров, upsert, инвалидация кэша
                                              ▼
                                    повторный запрос клиента отдаёт 200
```

Правило «пользовательский запрос не ходит синхронно во внешний API» при этом не нарушается:
HTTP-обработчик по-прежнему только читает свою БД и ставит задачу, а поход наружу делает воркер.

Дополнительно (Фаза 3): публикуемый seed-дамп с популярным ядром каталога, разворачиваемый
командой `pnpm db:seed:catalog` или профилем compose, — чтобы инстанс был полезен с первой минуты.

### 9.4 Эксплуатация self-host инсталляции

- **Обновление:** `docker compose pull && docker compose up -d`. Миграции только вперёд,
  выполняются сервисом `migrate` автоматически.
- **Бэкап:** документированная команда `pg_dump` и рекомендация проверять восстановление.
  Redis не бэкапится — это кэш и очереди, потеря некритична.
- **Ресурсы:** целевой минимум — 2 vCPU / 2 ГБ RAM для полного стека без нагрузки.
  Требование проверяется замером в Фазе 1, а не декларируется.
- **Логи** — в stdout, сбор оставлен на усмотрение хоста (docker logs / journald).
