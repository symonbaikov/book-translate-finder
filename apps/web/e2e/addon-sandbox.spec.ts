import { expect, test, type Page } from '@playwright/test';
import { composeWorkerSource, integrityOf } from '@golden/addons';

/**
 * Does the box actually hold?
 *
 * Everything else about the addon engine is unit-tested in Node, and none of it is evidence for
 * this. `mediatedFetch` returning a rejected promise proves that our function refuses; it says
 * nothing about whether a worker could have opened the socket anyway. Only a real engine, with the
 * real `Content-Security-Policy` header on the real document, can answer that — which is why this
 * suite drives `/addon-sandbox.html` rather than a stub.
 *
 * The split of responsibilities in each test below:
 *
 * - the **worker shim** and the **sandbox document** are the genuine articles, the first imported
 *   from `@golden/addons` and the second served by Next with its CSP;
 * - the **host half** is a thin harness written inline here rather than `SandboxedAddon`, because
 *   bundling the package into the page would put a bundler between us and the thing under test.
 *   The host's own logic — the declared-host allowlist, the credential pinning, the timeouts — is
 *   covered in `packages/addons/src/sandbox/host-fetch.test.ts`.
 *
 * So: everything below is a claim about isolation, and isolation is a property of the browser.
 */

const HARNESS_URL = 'http://localhost:3100/__addon-harness';

/** A page on the app's own origin, so the iframe below gets the real document and its real CSP. */
async function openHarness(page: Page): Promise<void> {
  await page.route(HARNESS_URL, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/html; charset=utf-8',
      body: '<!doctype html><html><head><title>harness</title></head><body></body></html>',
    }),
  );
  await page.goto(HARNESS_URL);
}

/**
 * Starts an addon in the real sandbox and calls `getMeta` once.
 *
 * `capabilities` is a map of capability name → handler, evaluated in the page. Whatever `getMeta`
 * returns comes back here, which is how each escape attempt reports what the engine did to it.
 */
async function runAddon(
  page: Page,
  addonSource: string,
  options: { allowedHosts?: string[]; timeoutMs?: number } = {},
): Promise<{ ok: boolean; value?: unknown; error?: string }> {
  return page.evaluate(
    async ({ source, allowedHosts, timeoutMs }) => {
      return new Promise<{ ok: boolean; value?: unknown; error?: string }>((resolve) => {
        const frame = document.createElement('iframe');
        frame.setAttribute('sandbox', 'allow-scripts');
        frame.src = '/addon-sandbox.html';
        frame.style.cssText = 'position:absolute;width:0;height:0;border:0;';

        const done = (outcome: { ok: boolean; value?: unknown; error?: string }): void => {
          window.removeEventListener('message', onMessage);
          clearTimeout(timer);
          resolve(outcome);
        };
        const timer = setTimeout(() => done({ ok: false, error: 'timeout' }), timeoutMs ?? 15_000);

        function post(message: unknown): void {
          frame.contentWindow?.postMessage(message, '*');
        }

        function onMessage(event: MessageEvent): void {
          if (event.source !== frame.contentWindow) return;
          const message = event.data as Record<string, unknown>;
          if (!message || message.v !== 1) return;

          if (message.type === 'booted') {
            post({ v: 1, type: 'start', addonId: 'probe', source });
            return;
          }
          if (message.type === 'ready') {
            post({ v: 1, type: 'invoke', callId: 'h1', method: 'getMeta', args: ['book', 'x'] });
            return;
          }
          if (message.type === 'invokeResult') {
            done({ ok: message.ok === true, value: message.value, error: String(message.error) });
            return;
          }
          if (message.type === 'fatal') {
            done({ ok: false, error: String(message.error) });
            return;
          }
          if (message.type === 'capability') {
            // The narrowest possible stand-in for the host: a declared-host check and a fetch.
            // The real one is unit-tested; what matters here is that the worker had to ask.
            const [url] = message.args as string[];
            const name = message.name as string;
            const reply = (ok: boolean, payload: unknown): void =>
              post(
                ok
                  ? {
                      v: 1,
                      type: 'capabilityResult',
                      callId: message.callId,
                      ok: true,
                      value: payload,
                    }
                  : {
                      v: 1,
                      type: 'capabilityResult',
                      callId: message.callId,
                      ok: false,
                      error: String(payload),
                    },
              );

            if (name !== 'fetchText') {
              reply(true, null);
              return;
            }
            let host = '';
            try {
              host = new URL(url).hostname;
            } catch {
              reply(false, 'not a url');
              return;
            }
            if (!(allowedHosts ?? []).includes(host)) {
              reply(false, `This addon did not ask for permission to contact ${host}.`);
              return;
            }
            fetch(url, { credentials: 'omit', referrerPolicy: 'no-referrer' })
              .then((response) => response.text())
              .then((text) => reply(true, text))
              .catch((error: Error) => reply(false, error.message));
          }
        }

        window.addEventListener('message', onMessage);
        document.body.appendChild(frame);
      });
    },
    { source: addonSource, allowedHosts: options.allowedHosts ?? [], timeoutMs: options.timeoutMs },
  );
}

/** An addon that runs `body` and reports whatever it observed, as the book's name. */
function probeAddon(body: string): string {
  return composeWorkerSource(`
    function probe() {
      var notes = {};
      function record(name, run) {
        try {
          notes[name] = 'allowed:' + String(run());
        } catch (error) {
          notes[name] = 'blocked:' + (error && error.name ? error.name : String(error));
        }
      }
      ${body}
      return notes;
    }
    registerAddon({
      manifest: {
        id: 'probe',
        version: '1.0.0',
        name: 'Probe',
        apiVersion: 1,
        resources: ['meta'],
        types: ['book'],
        catalogs: []
      },
      getMeta: function () {
        // Promise.resolve so a probe body may end in either a value or a promise of one.
        return Promise.resolve(probe()).then(function (notes) {
          return { meta: { id: 'probe', type: 'book', name: JSON.stringify(notes) } };
        });
      }
    });
  `);
}

async function notesFrom(page: Page, body: string, allowedHosts: string[] = []) {
  const result = await runAddon(page, probeAddon(body), { allowedHosts });
  expect(result.ok, `the addon did not answer: ${result.error}`).toBe(true);
  const meta = (result.value as { meta: { name: string } }).meta;
  return JSON.parse(meta.name) as Record<string, string>;
}

test.describe('the addon sandbox', () => {
  test.beforeEach(async ({ page }) => {
    await openHarness(page);
  });

  test('serves the sandbox document with a CSP that pins its own bootstrap', async ({ page }) => {
    const response = await page.request.get('/addon-sandbox.html');
    const csp = response.headers()['content-security-policy'] ?? '';
    expect(csp).toContain("connect-src 'none'");
    expect(csp).toContain('sandbox allow-scripts');
    expect(csp).toContain('worker-src blob:');
    expect(csp).toMatch(/script-src 'sha256-[A-Za-z0-9+/]{43}=' blob:/);
    // No blanket permission for inline script: the hash names the one bootstrap we wrote.
    expect(csp).not.toContain('unsafe-inline');
  });

  test('starts an addon at all — the four layers do not prevent the intended use', async ({
    page,
  }) => {
    const notes = await notesFrom(page, `record('alive', function () { return 1 + 1; });`);
    expect(notes.alive).toBe('allowed:2');
  });

  test('leaves the addon no ambient way onto the network', async ({ page }) => {
    const notes = await notesFrom(
      page,
      `
      record('fetch', function () { return typeof self.fetch; });
      record('xhr', function () { return new self.XMLHttpRequest(); });
      record('websocket', function () { return new self.WebSocket('wss://tracker.example'); });
      record('eventsource', function () { return new self.EventSource('https://tracker.example'); });
      record('importScripts', function () { return self.importScripts('https://tracker.example/x.js'); });
      `,
    );
    expect(notes.fetch).toBe('allowed:undefined');
    for (const key of ['xhr', 'websocket', 'eventsource', 'importScripts']) {
      expect(notes[key], `${key} was reachable`).toMatch(/^blocked:TypeError/);
    }
  });

  test('gives the addon no DOM, no document, and no way back to the page', async ({ page }) => {
    const notes = await notesFrom(
      page,
      `
      record('document', function () { return typeof self.document; });
      record('window', function () { return typeof self.window; });
      record('parent', function () { return typeof self.parent; });
      record('localStorage', function () { return typeof self.localStorage; });
      record('indexedDB', function () { return typeof self.indexedDB; });
      `,
    );
    expect(notes.document).toBe('allowed:undefined');
    expect(notes.window).toBe('allowed:undefined');
    expect(notes.parent).toBe('allowed:undefined');
    expect(notes.localStorage).toBe('allowed:undefined');
    expect(notes.indexedDB).toBe('allowed:undefined');
  });

  test('puts the sandbox document itself on an opaque origin', async ({ page }) => {
    await runAddon(page, probeAddon(''), {});
    const frame = page.frames().find((candidate) => candidate.url().includes('addon-sandbox.html'));
    expect(frame, 'the sandbox frame was not created').toBeDefined();

    const observed = await frame!.evaluate(() => {
      const check = (run: () => unknown): string => {
        try {
          return `allowed:${String(run())}`;
        } catch (error) {
          return `blocked:${(error as Error).name}`;
        }
      };
      return {
        origin: String(window.origin),
        localStorage: check(() => window.localStorage.length),
        cookie: check(() => {
          document.cookie = 'probe=1';
          return document.cookie;
        }),
        indexedDB: check(() => window.indexedDB.open('probe')),
        parentDom: check(() => window.parent.document.title),
      };
    });

    expect(observed.origin).toBe('null');
    expect(observed.localStorage).toMatch(/^blocked:/);
    expect(observed.indexedDB).toMatch(/^blocked:/);
    expect(observed.parentDom).toMatch(/^blocked:/);
    // Cookies do not throw everywhere; what must hold is that nothing is stored.
    expect(observed.cookie).not.toContain('probe=1');
  });

  test('will not let the sandbox document open a connection of its own', async ({ page }) => {
    await runAddon(page, probeAddon(''), {});
    const frame = page.frames().find((candidate) => candidate.url().includes('addon-sandbox.html'));
    // Deliberately a URL that is definitely reachable — this very server. A fetch to an invented
    // host would fail on DNS and prove nothing about the CSP, which is the thing under test.
    const blocked = await frame!.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:3100/addon-sandbox.html');
        return `allowed:${response.status}`;
      } catch (error) {
        return `blocked:${(error as Error).name}`;
      }
    });
    expect(blocked).toMatch(/^blocked:/);

    // And the same address from the host page, to show the refusal above was the policy and not
    // the network.
    await expect(
      page.evaluate(async () => (await fetch('/addon-sandbox.html')).status),
    ).resolves.toBe(200);
  });

  test('refuses a host the addon never declared, and nothing leaves the browser', async ({
    page,
  }) => {
    const attempted: string[] = [];
    await page.route('https://tracker.example/**', (route) => {
      attempted.push(route.request().url());
      return route.fulfill({ status: 200, body: 'should never be reached' });
    });

    const notes = await notesFrom(
      page,
      `
      notes.attempt = 'pending';
      return self.golden
        .fetchText('https://tracker.example/collect')
        .then(function (text) { notes.attempt = 'allowed:' + text; return notes; })
        .catch(function (error) { notes.attempt = 'blocked:' + error.message; return notes; });
      `,
      ['api.example.org'],
    );

    expect(notes.attempt).toContain('did not ask for permission to contact tracker.example');
    expect(attempted, 'a request was made despite the refusal').toEqual([]);
  });

  test('lets a declared host through, without a cookie of this instance', async ({ page }) => {
    await page
      .context()
      .addCookies([{ name: 'session', value: 'secret', url: 'http://localhost:3100' }]);

    let seenCookie: string | undefined = 'not-called';
    await page.route('http://localhost:3100/pretend-addon-api', (route) => {
      seenCookie = route.request().headers()['cookie'];
      return route.fulfill({ status: 200, contentType: 'text/plain', body: 'from the addon host' });
    });

    const notes = await notesFrom(
      page,
      `
      return self.golden
        .fetchText('http://localhost:3100/pretend-addon-api')
        .then(function (text) { notes.attempt = 'allowed:' + text; return notes; })
        .catch(function (error) { notes.attempt = 'blocked:' + error.message; return notes; });
      `,
      ['localhost'],
    );

    expect(notes.attempt).toBe('allowed:from the addon host');
    expect(seenCookie, 'the instance’s cookie was sent to an addon’s host').toBeUndefined();
  });

  test('does not let a runaway addon hold the page', async ({ page }) => {
    const result = await runAddon(
      page,
      composeWorkerSource(`
        registerAddon({
          manifest: {
            id: 'runaway', version: '1.0.0', name: 'Runaway', apiVersion: 1,
            resources: ['meta'], types: ['book'], catalogs: []
          },
          getMeta: function () { while (true) {} }
        });
      `),
      { timeoutMs: 4_000 },
    );
    expect(result.ok).toBe(false);
    expect(result.error).toBe('timeout');
    // The page that started it is still answering — which is the whole claim.
    await expect(page.evaluate(() => document.title)).resolves.toBe('harness');
  });
});

/**
 * The local transport, driven through the page a reader actually uses.
 *
 * Everything above proves the box holds. This proves the box is reachable: a bundle URL and a hash
 * typed into the form produce a running, sandboxed addon whose manifest the consent card can read —
 * and a wrong hash produces nothing at all.
 */
test.describe('installing a local addon', () => {
  const BUNDLE_URL = 'https://local.addon.test/addon.js';
  const BUNDLE = `registerAddon({
    manifest: {
      id: 'local-fixture',
      version: '2.0.0',
      name: 'Local Fixture',
      apiVersion: 1,
      resources: ['meta'],
      types: ['book'],
      catalogs: [],
      permissions: { hosts: ['api.example.org'] }
    },
    getMeta: function () {
      return { meta: { id: 'x', type: 'book', name: 'x' } };
    }
  });`;

  async function serveBundle(page: Page): Promise<void> {
    await page.route(BUNDLE_URL, (route) =>
      route.fulfill({
        status: 200,
        headers: { 'access-control-allow-origin': '*', 'content-type': 'text/javascript' },
        body: BUNDLE,
      }),
    );
  }

  test('runs the code, reads its manifest, and states that it is sandboxed', async ({ page }) => {
    await serveBundle(page);
    await page.goto('/addons');
    await page.getByLabel('Addon code address').fill(BUNDLE_URL);
    await page.getByLabel('Integrity hash').fill(await integrityOf(BUNDLE));
    await page
      .locator('form', { has: page.getByLabel('Addon code address') })
      .getByRole('button', { name: 'Continue' })
      .click();

    await expect(page.getByRole('heading', { name: /Local Fixture/ })).toBeVisible();
    // The two facts a reader chooses on: what it may contact, and that it cannot see them.
    await expect(page.getByText('api.example.org')).toBeVisible();
    await expect(page.getByText(/runs on your device in a sandbox/)).toBeVisible();

    await page.getByRole('button', { name: 'Install', exact: true }).click();
    await expect(page.locator('main').getByText('Local Fixture', { exact: true })).toBeVisible();
    await expect(page.locator('main')).toContainText('From a file');
  });

  test('refuses a bundle whose hash does not match, before running any of it', async ({ page }) => {
    await serveBundle(page);
    await page.goto('/addons');
    await page.getByLabel('Addon code address').fill(BUNDLE_URL);
    await page
      .getByLabel('Integrity hash')
      .fill(await integrityOf('something the author did not publish'));
    await page
      .locator('form', { has: page.getByLabel('Addon code address') })
      .getByRole('button', { name: 'Continue' })
      .click();

    // Scoped to `main`: the refusal is stated twice on purpose — inline next to the form, and in
    // the popup — and an unscoped match cannot tell which one it found.
    await expect(
      page.locator('main').getByText(/does not match the version that was installed/),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Install', exact: true })).toHaveCount(0);
  });
});
