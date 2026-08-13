# Прототип — Фаза 0 (одноразовый)

Разведочный прототип для проверки гипотезы проекта. **Выбрасывается в конце Фазы 1** — не
проходит проверку границ слоёв (`pnpm boundaries` его не сканирует), не входит в pnpm-workspace
монорепо, стоит своим `npm install`. Единственное правило, которое здесь всё равно действует —
легальная политика (`docs/legal-policy.md`).

Полные результаты разведки — [docs/research/coverage-phase0.md](../docs/research/coverage-phase0.md).

## Запуск

```bash
cd prototype
npm install
npm run dev
```

Откроется на `http://localhost:3010`.

## Почему тут есть API-роуты, а не «чистый клиент»

План Фазы 0 предполагал прямые запросы к API из браузера без бэкенда. По факту Open Library не
отдаёт `Access-Control-Allow-Origin` — прямой `fetch()` из браузера блокируется CORS (см. отчёт).
`app/api/search/route.ts` и `app/api/editions/route.ts` — это минимальный same-origin proxy
внутри того же Next.js-приложения: без БД, без очередей, без отдельного сервиса, просто
серверный `fetch` вместо клиентского.

## Правовой статус ссылок — не настоящий LinkPolicy

Издание помечено «есть скан на archive.org», если у него есть поле `ocaid` в ответе Open
Library. Это **не** подтверждение публичного домена — Internet Archive хостит и книги под
авторским правом в режиме controlled digital lending. Настоящий `LinkPolicy` с проверенными
инвариантами — Фаза 1.1, см. `docs/legal-policy.md`.
