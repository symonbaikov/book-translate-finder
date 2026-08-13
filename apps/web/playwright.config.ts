import { defineConfig } from '@playwright/test';

/**
 * E2E ("поиск → карточка → ссылки", docs/rules.md §5) runs against a fully live stack —
 * apps/web + apps/api + apps/worker + Postgres + Redis — the same way `test:integration` needs
 * a real Postgres/Redis via Testcontainers. Unlike that suite, this one can't spin the stack up
 * itself (it spans 3 processes plus two datastores), so it's a documented prerequisite: bring up
 * `docker/docker-compose.dev.yml`, run migrations/seed, and start apps/api + apps/worker before
 * `pnpm test:e2e`. `WEB_BASE_URL`/`API_BASE_URL` point at wherever those are actually running.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: process.env.WEB_BASE_URL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
});
