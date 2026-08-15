import { defineConfig } from '@playwright/test';

/**
 * The sandbox suite, separate from `playwright.config.ts` on purpose.
 *
 * That one drives the whole product — web + api + worker + Postgres + Redis — and is a documented
 * manual prerequisite. This one proves that a stranger's code cannot get out of the box we put it
 * in, which needs nothing but the web app serving one static file, so it starts its own server and
 * is runnable by anyone who has just cloned the repository. Coupling it to the full stack would
 * have made the security suite the hardest one to run, which is exactly backwards.
 *
 * Only Chromium is configured here because only Chromium's browser binary is installed by
 * `pnpm exec playwright install chromium`. The claims this suite makes are about CSP, opaque
 * origins and worker creation — three things engines genuinely differ on — so a green run here is
 * evidence for Chromium and for nothing else. Firefox and WebKit remain to be run before the
 * sandbox can be called verified; see docs/plan.md Phase 7.3.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: /addon-(sandbox|privacy)\.spec\.ts/,
  timeout: 60_000,
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3100',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm exec next dev -p 3100',
    url: 'http://localhost:3100/addon-sandbox.html',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
