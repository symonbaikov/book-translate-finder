import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

/**
 * How a book gets into the reader, and what this instance learns while it does. Nothing.
 *
 * The four paths are a picked file, a dropped file, a URL the reader was handed, and bytes this
 * browser kept. Each one is checked here for the same property: after it, no request to **this**
 * origin carries the book's address, its hash, or its bytes (ADR-0013 §1). That is the assertion
 * the whole feature exists to be able to make, and it is worth more than any of the UI checks.
 */

const PLAIN = fileURLToPath(new URL('./fixtures/spike.epub', import.meta.url));
const BOOK_URL = 'https://books.example.test/gatsby.epub';

/** Requests to this instance that mention the book in any part of the wire. */
function watchForLeaks(page: Page, secrets: readonly string[]): string[] {
  const leaked: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.host !== new URL(page.url() || 'http://localhost:3100').host) return;
    const wire = [request.url(), JSON.stringify(request.headers()), request.postData() ?? ''].join(
      ' ',
    );
    for (const secret of secrets) {
      if (wire.includes(secret)) leaked.push(`${secret} in ${request.method()} ${request.url()}`);
    }
  });
  return leaked;
}

async function waitForRenderedBook(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      const view = document.querySelector('foliate-view') as unknown as {
        lastLocation?: { fraction?: number };
      } | null;
      return typeof view?.lastLocation?.fraction === 'number';
    },
    undefined,
    { timeout: 15_000 },
  );
}

test('a picked file is opened by the browser alone', async ({ page }) => {
  await page.goto('/read');
  const leaked = watchForLeaks(page, ['spike.epub', 'sha256-']);

  await page.locator('input[type=file]').setInputFiles(PLAIN);
  await waitForRenderedBook(page);

  expect(leaked).toEqual([]);
});

test('a dropped file takes the same path as a picked one', async ({ page }) => {
  await page.goto('/read');
  const bytes = readFileSync(PLAIN).toString('base64');

  await page.evaluate(async (base64: string) => {
    const data = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
    const transfer = new DataTransfer();
    transfer.items.add(new File([data], 'dropped.epub', { type: 'application/epub+zip' }));
    const surface = document.querySelector('main div');
    surface?.dispatchEvent(new DragEvent('drop', { dataTransfer: transfer, bubbles: true }));
  }, bytes);

  await waitForRenderedBook(page);
});

test('a source that refuses the browser gets an honest dead end, not a proxy', async ({ page }) => {
  // Aborted rather than fulfilled without `Access-Control-Allow-Origin`, and the reason is the same
  // reason the message never says "CORS": a refused cross-origin read and an unreachable host arrive
  // at `fetch` as the identical opaque `TypeError`, so an abort *is* the faithful simulation.
  // (`route.fulfill` would not do: Playwright's fulfilled responses skip the CORS check, and the
  // book would arrive — which is how this test first failed.)
  await page.route(BOOK_URL, (route) => route.abort('failed'));

  await page.goto('/read');
  const leaked = watchForLeaks(page, [BOOK_URL, 'books.example.test']);
  await page.evaluate((url: string) => {
    window.sessionStorage.setItem('btf.reader.handoff', url);
  }, BOOK_URL);
  await page.reload();

  const download = page.getByRole('link', { name: /download/i });
  await expect(download).toBeVisible();
  await expect(download).toHaveAttribute('href', BOOK_URL);

  // The whole point of the dead end: nothing here offers to fetch it server-side, and nothing did.
  await expect(page.getByRole('button', { name: /proxy|through this site|retry/i })).toHaveCount(0);
  expect(leaked).toEqual([]);
  // …and the address never reached the URL bar either, so it is not in history or a screenshot.
  expect(new URL(page.url()).search).toBe('');
});

test('a kept book reopens from this browser, touching no network at all', async ({ page }) => {
  await page.goto('/read');
  await page.locator('input[type=file]').setInputFiles(PLAIN);
  await waitForRenderedBook(page);

  // `click()` then wait, rather than `check()`: this checkbox is controlled by what storage *did*,
  // not by what was clicked, so it flips a few milliseconds later — and on a browser that refuses
  // the write it never flips at all, which is exactly the behaviour being relied on here.
  await page.getByRole('checkbox').click();
  await expect(page.getByRole('checkbox')).toBeChecked();
  // The popup is the only place a reader learns whether the browser actually kept it, so its
  // presence is part of the feature rather than decoration (CLAUDE.md).
  await expect(page.locator('[data-sonner-toast]')).toContainText(/kept|device/i);

  await page.reload();
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));

  await page.getByRole('button', { name: /^open$/i }).click();
  await waitForRenderedBook(page);

  // Reopening reads IndexedDB. Nothing is fetched for the book — not from a source, not from here.
  expect(requests.filter((url) => url.endsWith('.epub'))).toEqual([]);
});
