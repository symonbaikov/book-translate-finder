import { fileURLToPath } from 'node:url';
import { expect, test, type Page } from '@playwright/test';

/**
 * Where the reader got to, what they marked, and the fact that all of it stays in their browser.
 *
 * The position is keyed by the file's content hash (identity.ts), so this suite proves the property
 * that key exists for: a book opened one way and reopened another is the same book at the same page.
 */

const PLAIN = fileURLToPath(new URL('./fixtures/spike.epub', import.meta.url));

async function waitForRenderedBook(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      const view = document.querySelector('foliate-view') as unknown as {
        renderer?: { getContents?: () => { doc?: Document }[] };
      } | null;
      return (view?.renderer?.getContents?.()[0]?.doc?.body?.textContent?.length ?? 0) > 0;
    },
    undefined,
    { timeout: 15_000 },
  );
}

/** What the page on screen actually says — the only honest answer to "did it resume". */
async function firstWords(page: Page): Promise<string> {
  return page.evaluate(() => {
    const view = document.querySelector('foliate-view') as unknown as {
      renderer?: { getContents?: () => { doc?: Document }[] };
    } | null;
    return view?.renderer?.getContents?.()[0]?.doc?.body?.textContent?.trim().slice(0, 40) ?? '';
  });
}

async function openAndKeep(page: Page): Promise<void> {
  await page.goto('/read');
  await page.locator('input[type=file]').setInputFiles(PLAIN);
  await waitForRenderedBook(page);
  await page.getByRole('checkbox').click();
  await expect(page.getByRole('checkbox')).toBeChecked();
}

test('reopening a book comes back to the page it was left on', async ({ page }) => {
  await openAndKeep(page);
  const opening = await firstWords(page);

  for (let turn = 0; turn < 8; turn += 1) {
    await page.getByRole('button', { name: /next/i }).click();
    await page.waitForTimeout(200);
  }
  const left = await firstWords(page);
  // Asserted against the opening page rather than against a chapter number: how many turns reach
  // chapter two depends on the viewport, and a test that encodes that is testing the window size.
  expect(left).not.toBe(opening);

  await page.reload();
  await page.getByRole('button', { name: /^open$/i }).click();
  await waitForRenderedBook(page);

  // Not "a position was stored" — the page in front of the reader is the one they left.
  expect(await firstWords(page)).toBe(left);
  await expect(page.getByText(/where you left off/i)).toBeVisible();
});

test('a bookmark and its note survive a reload', async ({ page }) => {
  await openAndKeep(page);
  await page.getByRole('button', { name: /bookmark this page/i }).click();
  // Filtered rather than `.first()`: keeping the file also announces itself, and which of the two
  // toasts is on top is a timing detail.
  await expect(page.locator('[data-sonner-toast]').filter({ hasText: /bookmark/i })).toBeVisible();

  const note = page.getByPlaceholder(/your own words/i);
  await note.fill('the bit about the boats');
  // Saved on blur, not on keystroke: a write and a popup per character would be both a write
  // amplifier and a popup nobody reads.
  await note.blur();
  await expect(page.locator('[data-sonner-toast]').filter({ hasText: /note/i })).toBeVisible();

  await page.reload();
  await page.getByRole('button', { name: /^open$/i }).click();
  await waitForRenderedBook(page);

  await expect(page.getByPlaceholder(/your own words/i)).toHaveValue('the bit about the boats');
});

test('the same bookmark twice is one bookmark', async ({ page }) => {
  await openAndKeep(page);
  const add = page.getByRole('button', { name: /bookmark this page/i });
  await add.click();
  await add.click();
  await add.click();

  // Idempotent by locator (progress.ts), because a button is a thing people double-click.
  await expect(page.getByRole('button', { name: /remove bookmark/i })).toHaveCount(1);
});

test('none of it reaches this instance', async ({ page }) => {
  await page.goto('/read');
  const leaked: string[] = [];
  const origin = new URL(page.url()).host;
  page.on('request', (request) => {
    if (new URL(request.url()).host !== origin) return;
    const wire = `${request.url()} ${JSON.stringify(request.headers())} ${request.postData() ?? ''}`;
    if (/epubcfi|sha256-|bookmark|the bit about the boats/i.test(wire)) leaked.push(request.url());
  });

  await page.locator('input[type=file]').setInputFiles(PLAIN);
  await waitForRenderedBook(page);
  await page.getByRole('button', { name: /next/i }).click();
  await page.getByRole('button', { name: /bookmark this page/i }).click();
  await page.getByPlaceholder(/your own words/i).fill('the bit about the boats');
  await page.getByPlaceholder(/your own words/i).blur();
  await page.waitForTimeout(500);

  // A reading position is a fact about a person. It stays on their device (ADR-0013 §1).
  expect(leaked).toEqual([]);
});
