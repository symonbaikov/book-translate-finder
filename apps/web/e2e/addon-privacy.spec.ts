import { expect, test, type Page, type Request } from '@playwright/test';

/**
 * The claim this suite exists to keep true: **the instance never learns which addons a reader has.**
 *
 * It is the half of the design that cannot be enforced by a type or a boundary rule. `pnpm
 * boundaries` already refuses to let `apps/api` or `packages/infrastructure` import
 * `@golden/addons`, which stops the server from ever *running* addon code — but nothing in the
 * build stops a well-meaning change on the client from putting an addon id into a telemetry ping,
 * an analytics call, or a query string. Only watching the wire catches that.
 *
 * So: install an addon, use the site, and assert that every request which did not go to the addon's
 * own origin is free of anything that identifies it.
 *
 * **What is deliberately not treated as a leak.** The reader's search term reaching this instance's
 * own `/api/search` is the instance's own feature working, not a disclosure — the reader typed it
 * into this site's search box. What must not travel is the addon: its id, its manifest URL, its
 * host. That distinction is the whole of ADR-0010 §6, and blurring it would make this test either
 * meaningless or unpassable.
 */

const ADDON_ORIGIN = 'https://fixture.addon.test';
const ADDON_ID = 'privacy-fixture';
const MANIFEST_URL = `${ADDON_ORIGIN}/manifest.json`;

/** Every string whose appearance anywhere off the addon's origin would be a leak. */
const MARKERS = [ADDON_ID, MANIFEST_URL, 'fixture.addon.test', 'privacy-fixture'];

const MANIFEST = {
  id: ADDON_ID,
  version: '1.0.0',
  name: 'Privacy Fixture',
  apiVersion: 1,
  resources: ['catalog', 'meta', 'source'],
  types: ['book'],
  catalogs: [{ type: 'book', id: 'all', name: 'All', extra: [{ name: 'search' }] }],
};

const CORS = {
  'access-control-allow-origin': '*',
  'content-type': 'application/json',
};

async function serveAddon(page: Page): Promise<{ addonHits: string[] }> {
  const addonHits: string[] = [];
  await page.route(`${ADDON_ORIGIN}/**`, (route) => {
    const url = route.request().url();
    addonHits.push(url);
    const body = url.includes('/catalog/')
      ? { metas: [{ id: 'pf:1', type: 'book', name: 'A Fixture Book' }] }
      : url.includes('/source/')
        ? { sources: [{ name: 'Fixture', url: 'https://example.org/a.epub' }] }
        : MANIFEST;
    return route.fulfill({ status: 200, headers: CORS, body: JSON.stringify(body) });
  });
  return { addonHits };
}

/** The "from a server" form. There are two Continue buttons on the page; this names one. */
function serverForm(page: Page) {
  return page.locator('form', { has: page.getByLabel('Addon address') });
}

/** Everything a request could smuggle a marker inside. */
function surfaceOf(request: Request): string {
  const headers = Object.entries(request.headers())
    .map(([name, value]) => `${name}: ${value}`)
    .join('\n');
  return [request.url(), headers, request.postData() ?? ''].join('\n');
}

test.describe('what the instance is told about addons', () => {
  test('is nothing at all, through installing and using one', async ({ page }) => {
    const { addonHits } = await serveAddon(page);

    const offAddon: Request[] = [];
    page.on('request', (request) => {
      if (!request.url().startsWith(ADDON_ORIGIN)) offAddon.push(request);
    });

    // Install it the way a reader would, through the page, rather than by writing localStorage.
    // Half the point is that the install flow itself does not phone home.
    await page.goto('/addons');
    await page.getByLabel('Addon address').fill(MANIFEST_URL);
    await serverForm(page).getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByRole('heading', { name: /Privacy Fixture/ })).toBeVisible();
    await page.getByRole('button', { name: 'Install', exact: true }).click();
    // Scoped to `main` and exact: the popup announcing the install also says the addon's name, and
    // an unscoped match would be satisfied by the popup without the addon ever reaching the list.
    await expect(page.locator('main').getByText('Privacy Fixture', { exact: true })).toBeVisible();

    // Then use the site with it installed. The search goes to an API that is not running in this
    // suite; that is fine and even useful — what matters is what the browser *sent*.
    await page.goto('/');
    await page.getByLabel('Title and author').fill('fixture');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.getByText('A Fixture Book')).toBeVisible({ timeout: 15_000 });

    // The addon really did run. Without this the assertion below could pass by doing nothing.
    expect(addonHits.some((url) => url.includes('/catalog/'))).toBe(true);

    const leaks = offAddon
      .map((request) => ({ url: request.url(), surface: surfaceOf(request) }))
      .filter((entry) => MARKERS.some((marker) => entry.surface.includes(marker)));

    expect(
      leaks.map((leak) => leak.url),
      'a request that did not go to the addon carried something identifying it',
    ).toEqual([]);
  });

  test('does not reach the instance even when an addon fails', async ({ page }) => {
    // A failure is where reporting instincts kick in, and where an error-reporting call would
    // quietly undo everything above.
    await page.route(`${ADDON_ORIGIN}/**`, (route) =>
      route.request().url().endsWith('manifest.json')
        ? route.fulfill({ status: 200, headers: CORS, body: JSON.stringify(MANIFEST) })
        : route.fulfill({ status: 500, headers: CORS, body: '{}' }),
    );

    const offAddon: Request[] = [];
    page.on('request', (request) => {
      if (!request.url().startsWith(ADDON_ORIGIN)) offAddon.push(request);
    });

    await page.goto('/addons');
    await page.getByLabel('Addon address').fill(MANIFEST_URL);
    await serverForm(page).getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Install', exact: true }).click();

    await page.goto('/');
    await page.getByLabel('Title and author').fill('fixture');
    await page.getByRole('button', { name: 'Search' }).click();
    await page.waitForTimeout(3_000);

    const leaks = offAddon.filter((request) =>
      MARKERS.some((marker) => surfaceOf(request).includes(marker)),
    );
    expect(leaks.map((request) => request.url())).toEqual([]);
  });

  test('keeps the installed list in the browser and nowhere else', async ({ page }) => {
    await serveAddon(page);
    await page.goto('/addons');
    await page.getByLabel('Addon address').fill(MANIFEST_URL);
    await serverForm(page).getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Install', exact: true }).click();

    const stored = await page.evaluate(() => window.localStorage.getItem('btf.addons'));
    expect(stored).toContain(ADDON_ID);

    // No cookie carries it either — a cookie would be sent to this instance on every navigation,
    // which is the same disclosure by a quieter route.
    const cookies = await page.context().cookies();
    const cookieText = cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join(';');
    expect(MARKERS.some((marker) => cookieText.includes(marker))).toBe(false);
  });
});
