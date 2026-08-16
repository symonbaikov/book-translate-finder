import { defineConfig, devices } from '@playwright/test';

/**
 * The reader's suite: what a book can do, and what this instance is told about it.
 *
 * Separate from `playwright.sandbox.config.ts` — which proves the same kind of thing about addons —
 * because these two answer to different documents and fail for different reasons, and because this
 * one runs in **three browsers** where that one runs in Chromium alone.
 *
 * Three, and it is not thoroughness for its own sake. ADR-0013 §3 says the reader stands on two
 * walls everywhere except WebKit, where it stands on one: that engine delivers no input at all to a
 * frame without `allow-scripts` (bug 218086, measured in spike 11.1b), so there the frame keeps the
 * token and the route's CSP is the only thing left between a stranger's EPUB and this origin. A
 * claim about WebKit that is only ever tested in Chromium is a claim about nothing.
 *
 * Like the addon suite it needs no database, no API and no seeding: it starts its own `next dev` and
 * opens files from `e2e/fixtures`. Keep it that way. A security suite that is hard to run is a
 * security suite nobody runs.
 */
export default defineConfig({
  testDir: './e2e',
  // Anchored to the file name, not "somewhere in the path". This worktree is checked out in a
  // directory called `client-side-reader-foliate-…`, so an unanchored `reader-.*\.spec\.ts`
  // matched every spec in the repository — including the ones that need a database — and reported
  // 77 passing tests as if that were good news.
  testMatch: /[\\/]reader-[a-z]+\.spec\.ts$/,
  timeout: 60_000,
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:3101',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: devices['Desktop Chrome'] },
    { name: 'firefox', use: devices['Desktop Firefox'] },
    { name: 'webkit', use: devices['Desktop Safari'] },
  ],
  webServer: {
    // 3101, not the addon suite's 3100: the two are meant to be runnable at the same time, and a
    // port collision between two security suites is a confusing way to learn that.
    command: 'pnpm exec next dev -p 3101',
    url: 'http://127.0.0.1:3101/read',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
