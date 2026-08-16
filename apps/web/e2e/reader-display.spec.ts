import { fileURLToPath } from 'node:url';
import { expect, test, type Page } from '@playwright/test';

/**
 * How the book looks, checked where it actually shows: inside the book's own document.
 *
 * Asserting that a preference was stored would prove nothing — the whole chain is storage, then a
 * palette read out of the application's design tokens, then CSS text injected into a document this
 * page does not own. So every assertion here reads the computed style of the rendered book.
 */

const PLAIN = fileURLToPath(new URL('./fixtures/spike.epub', import.meta.url));

async function openBook(page: Page): Promise<void> {
  await page.goto('/read');
  await page.locator('input[type=file]').setInputFiles(PLAIN);
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

/** The computed style of the book itself, which is the only thing the reader can see. */
async function bookStyle(page: Page): Promise<{
  background: string;
  color: string;
  lineHeight: string;
  columns: string | null;
  fontSize: string;
}> {
  return page.evaluate(() => {
    const view = document.querySelector('foliate-view') as unknown as {
      renderer?: (HTMLElement & { getContents?: () => { doc?: Document }[] }) | undefined;
    } | null;
    const doc = view?.renderer?.getContents?.()[0]?.doc;
    const win = doc?.defaultView;
    const body = doc?.body && win ? win.getComputedStyle(doc.body) : null;
    const paragraph = doc?.querySelector('p');
    return {
      background: body?.backgroundColor ?? '',
      color: body?.color ?? '',
      lineHeight: paragraph && win ? win.getComputedStyle(paragraph).lineHeight : '',
      columns: view?.renderer?.getAttribute('max-column-count') ?? null,
      fontSize: view?.renderer?.style.fontSize ?? '',
    };
  });
}

async function chooseTheme(page: Page, name: RegExp): Promise<void> {
  await page.getByRole('combobox', { name: /colours/i }).click();
  await page.getByRole('option', { name }).click();
}

test('E-Ink is black on white, one column, and nothing that moves', async ({ page }) => {
  await openBook(page);
  await chooseTheme(page, /e-ink/i);

  await expect.poll(async () => (await bookStyle(page)).background).toBe('rgb(255, 255, 255)');
  const style = await bookStyle(page);
  expect(style.color).toBe('rgb(0, 0, 0)');
  // Two columns on an e-paper panel is a line length nobody chose and twice the area to redraw.
  expect(style.columns).toBe('1');

  const motion = await page.evaluate(() => {
    const view = document.querySelector('foliate-view') as unknown as {
      renderer?: { getContents?: () => { doc?: Document }[] };
    } | null;
    const doc = view?.renderer?.getContents?.()[0]?.doc;
    const win = doc?.defaultView;
    const paragraph = doc?.querySelector('p');
    if (!paragraph || !win) return null;
    const computed = win.getComputedStyle(paragraph);
    return { transition: computed.transitionDuration, shadow: computed.textShadow };
  });
  expect(motion?.transition).toBe('0s');
  expect(motion?.shadow).toBe('none');

  await expect(page.locator('[data-sonner-toast]').filter({ hasText: /E-Ink/i })).toBeVisible();
});

test('sepia comes from the design tokens, not from the reader package', async ({ page }) => {
  await openBook(page);
  await chooseTheme(page, /sepia/i);

  // The exact value lives in tokens.css (ADR-0008). If it changes there, this changes with it —
  // which is the point of asserting it comes through at all rather than what it happens to be.
  const expected = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--reader-sepia-bg').trim(),
  );
  const rgb = await page.evaluate((hex: string) => {
    const probe = document.createElement('span');
    probe.style.color = hex;
    document.body.append(probe);
    const value = getComputedStyle(probe).color;
    probe.remove();
    return value;
  }, expected);

  await expect.poll(async () => (await bookStyle(page)).background).toBe(rgb);
});

test('type size and line spacing reach the book, and survive a reload', async ({ page }) => {
  await openBook(page);
  const before = await bookStyle(page);

  await page.getByRole('button', { name: /larger/i }).click();
  await page.getByRole('button', { name: /larger/i }).click();
  await expect.poll(async () => (await bookStyle(page)).fontSize).not.toBe(before.fontSize);
  const enlarged = await bookStyle(page);

  await page.getByRole('combobox', { name: /line spacing/i }).click();
  await page.getByRole('option', { name: '1.8' }).click();
  await expect.poll(async () => (await bookStyle(page)).lineHeight).not.toBe(before.lineHeight);

  // The preference is the reader's, not the book's: a different book opened later gets it too.
  await page.reload();
  await page.locator('input[type=file]').setInputFiles(PLAIN);
  await expect.poll(async () => (await bookStyle(page)).fontSize).toBe(enlarged.fontSize);
});

test('back to defaults says so, and puts the book back', async ({ page }) => {
  await openBook(page);
  const defaults = await bookStyle(page);

  await chooseTheme(page, /e-ink/i);
  await expect.poll(async () => (await bookStyle(page)).background).toBe('rgb(255, 255, 255)');

  await page.getByRole('button', { name: /back to defaults/i }).click();
  await expect(page.locator('[data-sonner-toast]').filter({ hasText: /defaults/i })).toBeVisible();
  await expect.poll(async () => (await bookStyle(page)).background).toBe(defaults.background);
});
