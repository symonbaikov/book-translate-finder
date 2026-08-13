# CLAUDE.md

Инструкции для Claude Code и любого агента/разработчика, работающего в этом репозитории.

## Что за проект

**BookTranslate Finder** — открытый агрегатор переводов книг. Пользователь вводит название и
автора, сервис отвечает: на какие языки книга переводилась, какие издания существуют и где
получить текст **легально** — прямое скачивание для public domain, диплинк на покупку или
библиотечное заимствование для книг под авторским правом.

Ценность не в данных (они уже открыты: Open Library, Google Books, WorldCat, Index Translationum),
а в **агрегации, нормализации и человеческом UX** поверх разрозненных источников.

Проект open-source и рассчитан на **self-hosting**: любой человек должен разворачивать свою
копию тремя командами через Docker Compose. Это влияет на решения — конфигурация только через
`.env`, миграции автоматические, ключи платных источников опциональны, а пустая база у свежей
инсталляции наполняется лениво по первым запросам.

Исходный бриф: [BookTranslate_Finder_Plan.pdf](docs/source/BookTranslate_Finder_Plan.pdf) →
разложен по документам ниже.

## Главный инвариант проекта (нарушать нельзя)

Никакого скрейпинга и никаких ссылок на теневые библиотеки (Library Genesis, Anna's Archive,
Z-Library и подобные) — ни как источник данных, ни как источник ссылок. Прямая ссылка на
скачивание допустима **только** для public domain / открытой лицензии из allowlist провайдеров.
Это архитектурное решение и юридический риск, а не пожелание — см. [docs/legal-policy.md](docs/legal-policy.md).
Правило закреплено в доменном коде и покрыто тестами; при конфликте с любой другой задачей —
побеждает это правило.

## Документация

| Файл                                         | Назначение                                              |
| -------------------------------------------- | ------------------------------------------------------- |
| [docs/plan.md](docs/plan.md)                 | Фазы работ, задачи, Definition of Done, критерии успеха |
| [docs/architecture.md](docs/architecture.md) | Слои Clean Architecture, модули, порты, схема БД, API   |
| [docs/rules.md](docs/rules.md)               | SOLID, идемпотентность, правила кода, тестов, коммитов  |
| [docs/legal-policy.md](docs/legal-policy.md) | Легальная политика как исполняемые инварианты           |
| [docs/adr/](docs/adr/)                       | Architecture Decision Records                           |

Перед изменением кода прочитай `docs/rules.md`. Перед добавлением слоя/модуля — `docs/architecture.md`.

## Стек

TypeScript (strict) · Next.js + React (web) · NestJS на Fastify (API) · PostgreSQL + Drizzle ORM ·
Redis · BullMQ (фоновые джобы) · Docker Compose (локально) · GitHub Actions (CI/CD) ·
Vitest + Testcontainers + Playwright (тесты).

## Структура репозитория

```
apps/
  web/            Next.js — поиск, карточка книги, список изданий и ссылок
  api/            NestJS/Fastify — REST, rate limiting, композиция зависимостей
  worker/         BullMQ-воркеры — синхронизация источников, импорт выгрузок
packages/
  domain/         Сущности, value objects, доменные правила, ПОРТЫ. Ноль внешних зависимостей
  application/    Use cases (интеракторы). Зависят только от domain
  infrastructure/ Адаптеры: Postgres, Redis, HTTP-клиенты источников, очереди
  contracts/      Zod-схемы и DTO, общие для web и api
docs/             Документация проекта
docker/           Compose-файлы, Dockerfile'ы
```

Направление зависимостей строго внутрь: `apps → infrastructure → application → domain`.
`domain` не импортирует ничего из проекта, кроме себя.

## Команды

> Статус: репозиторий на этапе Фазы 0 — скелет ещё не создан. Команды ниже являются
> **контрактом**: при инициализации монорепо они должны заработать именно в этом виде.
> Не изобретай альтернативные имена скриптов — правь этот список, если контракт меняется.

Пакетный менеджер — **pnpm** (workspaces).

### Запуск

```bash
pnpm install
```

```bash
cp .env.example .env
```

```bash
docker compose -f docker/docker-compose.dev.yml up -d
```

```bash
pnpm db:migrate && pnpm db:seed
```

```bash
pnpm dev
```

`pnpm dev` поднимает web (`http://localhost:3000`), api (`http://localhost:3001`) и worker
параллельно. Отдельно: `pnpm --filter @btf/web dev`, `pnpm --filter @btf/api dev`,
`pnpm --filter @btf/worker dev`.

apps/api и apps/worker читают корневой `.env` напрямую (`tsx --env-file=../../.env`). apps/web —
Next.js-приложение и читает переменные окружения только из **своей собственной** директории
(`apps/web/.env.local`), не из корня монорепо — это ограничение самого Next.js, а не решение
проекта. Разово:

```bash
cp apps/web/.env.example apps/web/.env.local
```

### Качество кода

```bash
pnpm lint
```

```bash
pnpm typecheck
```

```bash
pnpm format
```

### Тесты

```bash
pnpm test
```

```bash
pnpm test:unit
```

```bash
pnpm test:integration
```

```bash
pnpm test:e2e
```

`test:integration` поднимает Postgres и Redis через Testcontainers — нужен работающий Docker.

### База данных

```bash
pnpm db:generate
```

```bash
pnpm db:migrate
```

```bash
pnpm db:seed
```

### Синхронизация источников (ручной запуск)

```bash
pnpm sync -- --source=open-library --work=<workId>
```

### Сборка

```bash
pnpm build
```

### Self-hosting (целевой сценарий для пользователей проекта)

Разворачивание чужой копии — три команды, без сборки из исходников и без ручных миграций.
Корневой `docker-compose.yml` тянет готовые образы из GHCR; миграции выполняет отдельный
one-shot сервис `migrate`.

```bash
cp .env.example .env
```

```bash
docker compose up -d
```

```bash
docker compose logs -f api
```

Обновление версии:

```bash
docker compose pull && docker compose up -d
```

Бэкап базы:

```bash
docker compose exec -T postgres pg_dump -U btf btf | gzip > backup-$(date +%F).sql.gz
```

Детали топологии, переменных окружения и решения проблемы холодной базы —
[architecture.md §9](docs/architecture.md#9-развёртывание-и-self-hosting) и
[ADR-0003](docs/adr/0003-lazy-backfill.md).

## Правила работы агента в этом репозитории

- Начинай с `docs/plan.md`: определи текущую фазу и не выходи за её объём без явной просьбы.
- Не добавляй зависимость в `packages/domain`. Никогда.
- Любой внешний источник данных подключается только через порт в `domain` и адаптер в
  `infrastructure`. Прямой вызов `fetch` из use case — ошибка ревью.
- Любая операция записи, вызываемая джобой или ретраем, должна быть идемпотентной
  (см. раздел «Идемпотентность» в `docs/rules.md`). Новый `INSERT` без стратегии конфликта — ошибка ревью.
- Секреты и ключи источников — только через переменные окружения, `.env` не коммитится.
- Ответ пользователю на русском; код, комментарии в коде, коммиты и идентификаторы — на английском.
