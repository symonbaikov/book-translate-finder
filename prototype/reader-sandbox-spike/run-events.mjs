/**
 * Does a tap reach a content frame that has no `allow-scripts`?
 *
 * The patch this project carries removes that token from every frame foliate renders book content
 * into, and upstream's own comment warns it "is needed for events because of WebKit bug 218086".
 * If that is still true, tap-to-turn is dead in Safari — which is most of the mobile reading this
 * feature exists for — and the reader needs input handling that never depends on the frame.
 *
 * Real mouse clicks, delivered by the browser at real coordinates. `dispatchEvent` would be answered
 * by our own code and prove nothing: `isTrusted` is printed for exactly that reason.
 *
 *   node prototype/reader-sandbox-spike/run-events.mjs
 */
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(
  fileURLToPath(new URL('../../apps/web/package.json', import.meta.url)),
);
const { chromium, firefox, webkit } = require('@playwright/test');

const PORT = 3201;
const server = spawn(process.execPath, [fileURLToPath(new URL('./server.mjs', import.meta.url))], {
  stdio: ['ignore', 'inherit', 'inherit'],
  env: { ...process.env, PORT: String(PORT) },
});
process.on('exit', () => server.kill());
await new Promise((resolve) => setTimeout(resolve, 500));

console.log(
  `\n${'='.repeat(90)}\nSPIKE 11.1b — does a real tap reach a frame without allow-scripts?\n${'='.repeat(90)}`,
);

for (const [name, engine] of [
  ['chromium', chromium],
  ['firefox', firefox],
  ['webkit', webkit],
]) {
  const browser = await engine.launch();
  const page = await browser.newPage();
  await page.goto(`http://localhost:${PORT}/events.html`, { waitUntil: 'load' });
  await page.waitForTimeout(300);

  for (const key of ['with', 'without']) {
    const box = await page.locator(`#${key}`).boundingBox();
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.keyboard.press('ArrowRight');
  }
  await page.waitForTimeout(300);

  const heard = await page.evaluate(() => window.__heard);
  console.log(`\n── ${name}`);
  for (const key of ['with', 'without']) {
    const events = heard[key];
    console.log(`   ${key.padEnd(8)} ${events.length ? events.join(', ') : 'NOTHING HEARD'}`);
  }
  await browser.close();
}

console.log(`\n${'='.repeat(90)}`);
server.kill();
process.exit(0);
