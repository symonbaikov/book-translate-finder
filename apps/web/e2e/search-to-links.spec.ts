import { expect, request as playwrightRequest, test } from '@playwright/test';

/**
 * "Search → card → links" (docs/rules.md §5). Seeds its own data via `POST /api/sync/:source`
 * (the same admin endpoint `docs/architecture.md §4` documents) instead of assuming the DB
 * already has the book — makes the suite deterministic against a freshly-migrated database, the
 * same way a self-hosted install would start empty (docs/adr/0003-lazy-backfill.md).
 */

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3001';
const ADMIN_TOKEN = process.env.E2E_ADMIN_TOKEN;

const BOOK_TITLE = 'The Hobbit';
const BOOK_QUERY = 'The Hobbit Tolkien';

test.beforeAll(async () => {
  if (!ADMIN_TOKEN) {
    throw new Error(
      'E2E_ADMIN_TOKEN must be set (matching ADMIN_TOKEN in .env) so the suite can seed data via POST /api/sync/:source.',
    );
  }

  const api = await playwrightRequest.newContext({ baseURL: API_BASE_URL });

  const syncRes = await api.post('/api/sync/open-library', {
    headers: { 'Idempotency-Key': `e2e-seed-${Date.now()}`, 'X-Admin-Token': ADMIN_TOKEN },
    data: { query: BOOK_QUERY },
  });
  expect(syncRes.ok(), 'seed sync request should be accepted').toBe(true);

  // apps/worker processes the queued job asynchronously — poll the real search endpoint (not
  // the UI) until the book is actually findable before the UI test starts.
  await expect
    .poll(
      async () => {
        const searchRes = await api.get(`/api/search?q=${encodeURIComponent(BOOK_QUERY)}`);
        const body = (await searchRes.json()) as { status: string };
        return body.status;
      },
      { timeout: 30_000, intervals: [2000] },
    )
    .toBe('found');

  await api.dispose();
});

test('search finds a known book, opens its card, and shows the edition-links block', async ({
  page,
}) => {
  await page.goto('/');

  await page.getByLabel('Book title and author').fill(BOOK_QUERY);
  await page.getByRole('button', { name: 'Search' }).click();

  const resultLink = page.getByRole('link', { name: BOOK_TITLE });
  await expect(resultLink).toBeVisible({ timeout: 15_000 });
  await resultLink.click();

  await expect(page.getByRole('heading', { name: BOOK_TITLE })).toBeVisible();
  await expect(page.getByText('Translated into')).toBeVisible();

  const firstLinksButton = page.getByRole('button', { name: 'Show links' }).first();
  await firstLinksButton.click();

  // Either real links render or the explicit empty state does — both prove the block resolved;
  // the point is that it's neither stuck loading nor showing an error.
  await expect(
    page
      .getByText('No legal links for this edition yet.')
      .or(page.locator('a[target="_blank"]').first()),
  ).toBeVisible({ timeout: 10_000 });
});
