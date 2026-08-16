import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

/**
 * The reading route's two walls, exercised against the real route with a real hostile book.
 *
 * Spike 11.1 measured both walls in a bare harness; this is the same question asked of the
 * application, which is where the CSP is actually assembled and where the frame attribute is
 * actually chosen. A policy that is correct in a test server and wrong in `middleware.ts` would
 * pass the spike and ship the hole.
 *
 * Runs in the sandbox config (`pnpm test:sandbox`) rather than the full-stack one, and that is the
 * point: no database, no API, no seed. A security suite that is hard to run is a security suite
 * nobody runs.
 */

const HOSTILE = fileURLToPath(new URL('./fixtures/hostile.epub', import.meta.url));
const PLAIN = fileURLToPath(new URL('./fixtures/spike.epub', import.meta.url));

/**
 * Wait until a book is actually rendered.
 *
 * `setInputFiles` returns as soon as the file is handed over; opening, laying out and painting the
 * first page happen afterwards. Reading the frame before that finds `null` and reports it as a
 * containment failure, which is the most misleading way this suite could fail.
 */
async function waitForRenderedBook(page: import('@playwright/test').Page): Promise<void> {
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

/** `script-src`'s own sources, split out of the header rather than string-matched across it. */
function scriptSrc(csp: string): string[] {
  const directive = csp
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('script-src '));
  return directive ? directive.slice('script-src '.length).split(/\s+/) : [];
}

test('the route carries a policy that cannot serve a book its own scripts', async ({ page }) => {
  const response = await page.goto('/read');
  const csp = response?.headers()['content-security-policy'] ?? '';
  const sources = scriptSrc(csp);

  expect(sources).toContain("'self'");
  expect(sources.some((source) => source.startsWith("'nonce-"))).toBe(true);
  // The two that would re-enable every inline and blob-served script in every EPUB. If a change
  // ever needs one of them, it needs a new ADR, not a green test.
  expect(sources).not.toContain("'unsafe-inline'");
  expect(sources).not.toContain('blob:');
  // A book's form has nowhere to post to, including back to this instance.
  expect(csp).toContain("form-action 'none'");
});

test('a hostile book is contained, and the frame it runs in refuses scripts', async ({ page }) => {
  const attempted: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('__beacon')) attempted.push(request.url());
  });
  const escaped: string[] = [];
  await page.exposeFunction('__reportEscape', (via: string) => void escaped.push(via));

  await page.goto('/read');
  await page.evaluate(() => {
    window.addEventListener('message', (event: MessageEvent<{ hostile?: string }>) => {
      if (event.data?.hostile)
        void (window as never as Record<string, (v: string) => void>)['__reportEscape'](
          event.data.hostile,
        );
    });
  });

  await page.locator('input[type=file]').setInputFiles(HOSTILE);
  await waitForRenderedBook(page);
  await expect(page.locator('[data-content-frame-walls]')).toHaveAttribute(
    'data-content-frame-walls',
    '2',
  );

  const contents = await page.evaluate(() => {
    const view = document.querySelector('foliate-view') as unknown as {
      renderer?: { getContents?: () => { doc?: Document }[] };
    } | null;
    const doc = view?.renderer?.getContents?.()[0]?.doc;
    return {
      sandbox: doc?.defaultView?.frameElement?.getAttribute('sandbox') ?? null,
      // The book's inline script sets this to 'pwned' if it ever runs.
      title: doc?.title ?? null,
      scripts: doc?.querySelectorAll('script').length ?? 0,
    };
  });

  expect(contents.sandbox).toBe('allow-same-origin');
  expect(contents.scripts).toBeGreaterThan(0); // the fixture really does contain scripts
  expect(contents.title).toBe('Hostile'); // …and none of them ran
  expect(attempted).toEqual([]);
  expect(escaped).toEqual([]);
});

test('the CSP alone contains it, which is what WebKit readers rely on', async ({ page }) => {
  // WebKit delivers no input to a frame without `allow-scripts` (bug 218086), so there the frame
  // keeps the token and this header is the only wall left (ADR-0013 §3). Chromium is made to run
  // that configuration here, because the alternative is shipping it untested to Safari.
  const attempted: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('__beacon')) attempted.push(request.url());
  });

  await page.goto('/read');
  await expect(page.locator('[data-content-frame-walls]')).toBeVisible();
  await page.evaluate(() => {
    (globalThis as Record<string, unknown>)['__goldenReaderContentFrameSandbox'] =
      'allow-same-origin allow-scripts';
  });

  await page.locator('input[type=file]').setInputFiles(HOSTILE);
  await waitForRenderedBook(page);
  const contents = await page.evaluate(() => {
    const view = document.querySelector('foliate-view') as unknown as {
      renderer?: { getContents?: () => { doc?: Document }[] };
    } | null;
    const doc = view?.renderer?.getContents?.()[0]?.doc;
    return {
      sandbox: doc?.defaultView?.frameElement?.getAttribute('sandbox') ?? null,
      title: doc?.title ?? null,
    };
  });

  expect(contents.sandbox).toBe('allow-same-origin allow-scripts');
  expect(contents.title).toBe('Hostile');
  expect(attempted).toEqual([]);
});

test('an ordinary book opens, paginates, and turns a page', async ({ page }) => {
  await page.goto('/read');
  await page.locator('input[type=file]').setInputFiles(PLAIN);
  await waitForRenderedBook(page);

  const first = await page.evaluate(() => {
    const view = document.querySelector('foliate-view') as unknown as {
      lastLocation?: { fraction?: number };
    } | null;
    return view?.lastLocation?.fraction ?? null;
  });
  expect(first).not.toBeNull();

  await page.getByRole('button', { name: /next|nächste|следующая/i }).click();
  await page.waitForTimeout(500);

  const second = await page.evaluate(() => {
    const view = document.querySelector('foliate-view') as unknown as {
      lastLocation?: { fraction?: number };
    } | null;
    return view?.lastLocation?.fraction ?? null;
  });
  expect(second).toBeGreaterThan(first as number);
});
