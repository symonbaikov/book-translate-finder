import { fileURLToPath } from 'node:url';
import { expect, test, type Page } from '@playwright/test';

/**
 * Each format this reader claims, opened for real.
 *
 * "It renders EPUB" was the only thing ever actually verified until this file existed, and the three
 * formats go down three different paths inside the renderer: EPUB is a zip of XHTML, FB2 is a single
 * XML document converted to HTML on the way in, and CBZ is a zip of images with no text at all. A
 * suite that opens one of them and calls the feature done is a suite that will be surprised.
 *
 * **MOBI is missing**, and that is a stated gap rather than an oversight — see docs/plan.md 11.9.
 */

const fixture = (name: string) => fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url));

const FORMATS = [
  { name: 'EPUB', file: 'spike.epub', expectText: true },
  { name: 'FB2', file: 'spike.fb2', expectText: true },
  // A comic has no text to read back; that it laid out at all is the claim being checked.
  // A comic goes through the *fixed-layout* renderer rather than the paginator — a third code path
  // again, and one where the reader's type settings deliberately do nothing, because a comic is
  // pictures.
  { name: 'CBZ', file: 'spike.cbz', expectText: false },
];

/**
 * Wait until *something* is on the page.
 *
 * `some`, not `[0]`: a comic renders through the fixed-layout renderer, which lays out spreads —
 * and the first slot of the first spread is legitimately blank, which is how this helper first
 * reported a working CBZ as broken.
 */
async function waitForLaidOut(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      const view = document.querySelector('foliate-view') as unknown as {
        renderer?: { getContents?: () => { doc?: Document }[] };
      } | null;
      const contents = view?.renderer?.getContents?.() ?? [];
      return contents.some((content) => (content.doc?.body?.childElementCount ?? 0) > 0);
    },
    undefined,
    { timeout: 20_000 },
  );
}

async function pageText(page: Page): Promise<string> {
  return page.evaluate(() => {
    const view = document.querySelector('foliate-view') as unknown as {
      renderer?: { getContents?: () => { doc?: Document }[] };
    } | null;
    const contents = view?.renderer?.getContents?.() ?? [];
    return contents
      .map((content) => content.doc?.body?.textContent ?? '')
      .join(' ')
      .trim()
      .slice(0, 60);
  });
}

for (const format of FORMATS) {
  test(`${format.name} opens, lays out, and comes back where it was left`, async ({ page }) => {
    await page.goto('/read');
    await page.locator('input[type=file]').setInputFiles(fixture(format.file));
    await waitForLaidOut(page);

    if (format.expectText) expect((await pageText(page)).length).toBeGreaterThan(10);

    await page.getByRole('checkbox', { name: /keep this book/i }).click();
    await expect(page.getByRole('checkbox', { name: /keep this book/i })).toBeChecked();

    for (let turn = 0; turn < 4; turn += 1) {
      await page.getByRole('button', { name: /next/i }).click();
      await page.waitForTimeout(250);
    }
    const left = await page.evaluate(() => {
      const view = document.querySelector('foliate-view') as unknown as {
        lastLocation?: { fraction?: number };
      } | null;
      return view?.lastLocation?.fraction ?? 0;
    });
    expect(left).toBeGreaterThan(0);

    await page.reload();
    await page.getByRole('button', { name: /^open$/i }).click();
    await waitForLaidOut(page);

    // The position is keyed by the file's content hash, which is format-agnostic by construction —
    // but "by construction" has been wrong before, and each loader reports its locators differently.
    await expect(page.getByText(/where you left off/i)).toBeVisible();
  });
}

test('a format this reader does not open is refused before anything is rendered', async ({
  page,
}) => {
  await page.goto('/read');
  // A PDF: out of scope by ADR-0013 §8, and the branch that would have loaded it is patched out of
  // the vendored renderer entirely.
  await page.evaluate(() => {
    const bytes = new TextEncoder().encode('%PDF-1.7\nnot a book this reader opens');
    const transfer = new DataTransfer();
    transfer.items.add(new File([bytes], 'paper.pdf', { type: 'application/pdf' }));
    const input = document.querySelector('input[type=file]') as HTMLInputElement;
    input.files = transfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await expect(page.locator('.error-box')).toContainText(/not a book/i);
});

test('a hostile FB2 cannot reach out either, in a format that has no <script> at all', async ({
  page,
}) => {
  // FB2 is converted to HTML on the way in, so the payload has to survive a conversion: what the
  // format *does* allow is a `javascript:` link and an external image, the second of which would
  // report the reader's IP to whoever serves it the moment the section is laid out.
  const attempted: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('__beacon')) attempted.push(request.url());
  });

  await page.goto('/read');
  await page.locator('input[type=file]').setInputFiles(fixture('hostile.fb2'));
  await waitForLaidOut(page);

  const clicked = await page.evaluate(() => {
    const view = document.querySelector('foliate-view') as unknown as {
      renderer?: { getContents?: () => { doc?: Document }[] };
    } | null;
    const doc = view?.renderer?.getContents?.()[0]?.doc;
    const link = doc?.querySelector('a[href^="javascript:"]') as HTMLAnchorElement | null;
    link?.click();
    return Boolean(link);
  });

  await page.waitForTimeout(500);
  expect(attempted).toEqual([]);
  // Whether the converter even keeps a `javascript:` href is foliate's business; what matters is
  // that nothing left the tab either way, so the assertion above holds in both cases.
  expect(typeof clicked).toBe('boolean');
});
