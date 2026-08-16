/**
 * Drives the spike in every engine that has a binary installed, and prints one table.
 *
 * Playwright is borrowed from `apps/web` rather than added here: this directory is a throwaway
 * (docs/plan.md Phase 11.1) and a second lockfile would outlive the question it was created for.
 *
 *   node prototype/reader-sandbox-spike/run.mjs
 */
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(
  fileURLToPath(new URL('../../apps/web/package.json', import.meta.url)),
);
const { chromium, firefox, webkit } = require('@playwright/test');

const PORT = 3200;
const ENGINES = [
  ['chromium', chromium],
  ['firefox', firefox],
  ['webkit', webkit],
];
const CASES = [
  // Step 1 — the question 11.1 exists to answer, plus its control.
  ['control · same-origin frame', { frame: 'same-origin' }],
  ['A · opaque origin (the design under test)', { frame: 'sandboxed' }],
  // Step 2 — the fallback branch: an ordinary same-origin route, hostile book, first as foliate
  // ships it and then with `allow-scripts` stripped from the content frames.
  ['B1 · same-origin route, hostile book, foliate defaults', { frame: 'plain', book: 'hostile' }],
  [
    'B2 · same-origin route, hostile book, allow-scripts stripped',
    { frame: 'plain', book: 'hostile', scripts: 'off' },
  ],
  [
    'B3 · same-origin route, hostile book, route CSP only',
    { frame: 'plain', book: 'hostile', csp: 'route' },
  ],
];

const server = spawn(process.execPath, [fileURLToPath(new URL('./server.mjs', import.meta.url))], {
  stdio: ['ignore', 'inherit', 'inherit'],
  env: { ...process.env, PORT: String(PORT) },
});
process.on('exit', () => server.kill());

await new Promise((resolve) => setTimeout(resolve, 500));

const results = [];
for (const [engineName, engine] of ENGINES) {
  let browser;
  try {
    browser = await engine.launch();
  } catch (error) {
    results.push({
      engine: engineName,
      case: '—',
      result: { fatal: `launch failed: ${error.message}` },
    });
    continue;
  }
  for (const [caseName, params] of CASES) {
    const page = await browser.newPage();
    const consoleErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => consoleErrors.push(`pageerror: ${error.message}`));
    try {
      // The beacon log is per case: a request the previous case's hostile book made would
      // otherwise be read as this one's escape.
      await fetch(`http://localhost:${PORT}/__beacons/reset`);
      const query = new URLSearchParams(params).toString();
      await page.goto(`http://localhost:${PORT}/host.html?${query}`, { waitUntil: 'load' });
      await page.waitForFunction(() => window.__spikeResult !== undefined, { timeout: 45_000 });
      const result = await page.evaluate(() => window.__spikeResult);
      const beacons = await (await fetch(`http://localhost:${PORT}/__beacons`)).json();
      results.push({
        engine: engineName,
        case: caseName,
        result: { ...result, beacons },
        consoleErrors,
      });
    } catch (error) {
      results.push({
        engine: engineName,
        case: caseName,
        result: { fatal: error.message },
        consoleErrors,
      });
    }
    await page.close();
  }
  await browser.close();
}

console.log(
  `\n${'='.repeat(100)}\nSPIKE 11.1 — does foliate-js paginate on an opaque origin?\n${'='.repeat(100)}`,
);
for (const row of results) {
  const { result } = row;
  const foliate = result.foliate;
  const turns = Array.isArray(foliate?.relocations) ? foliate.relocations : [];
  const fractions = turns.map((relocation) => relocation.fraction);
  console.log(`\n── ${row.engine} · ${row.case}`);
  if (result.fatal) {
    console.log(`   FATAL ${result.fatal}`);
  } else {
    console.log(`   origin              ${result.origin} (opaque: ${result.opaqueOrigin})`);
    console.log(`   localStorage        ${result.storage}`);
    console.log(`   nested frame        ${JSON.stringify(result.nestedFrame, null, 0)}`);
    console.log(`   frame events        ${result.contentFrameEvents ?? '—'}`);
    console.log(`   foliate opened      ${foliate?.opened} (sections: ${foliate?.sections})`);
    console.log(`   foliate error       ${foliate?.error ?? '—'}`);
    console.log(`   relocations         ${turns.length} → fractions ${JSON.stringify(fractions)}`);
    console.log(
      `   csp violations      ${result.violations?.length ? JSON.stringify(result.violations) : '—'}`,
    );
    if (result.book === 'hostile') {
      console.log(
        `   book escaped via    ${[...(result.beacons ?? []), ...(result.hostileMessages ?? [])].join(', ') || 'nothing'}`,
      );
    }
    const paginates = foliate?.opened && fractions.length > 1 && fractions.at(-1) > fractions[0];
    const escaped = (result.beacons?.length ?? 0) + (result.hostileMessages?.length ?? 0) > 0;
    console.log(
      `   VERDICT             ${paginates ? 'PAGES TURN' : 'DOES NOT PAGINATE'}${
        result.book === 'hostile' ? (escaped ? ' · BOOK ESCAPED' : ' · BOOK CONTAINED') : ''
      }`,
    );
  }
  if (row.consoleErrors?.length) {
    console.log(`   console             ${row.consoleErrors.slice(0, 4).join(' | ')}`);
  }
}

console.log(`\n${'='.repeat(100)}`);
server.kill();
process.exit(0);
