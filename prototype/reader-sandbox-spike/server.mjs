/**
 * The spike's static server. Not the app, on purpose: the question is about browser behaviour, and
 * a Next.js dev server would put its own headers, its own origin and its own script loading in
 * front of the thing being measured.
 *
 * Two headers matter here and both are deliberate:
 *
 * - `Access-Control-Allow-Origin: *` — a document on an opaque origin is cross-origin to
 *   everything, including the server it was served from. Module scripts are fetched with CORS, so
 *   without this the sandbox document cannot import anything at all and every probe would fail for
 *   a reason that has nothing to do with pagination.
 * - The sandbox document's CSP, applied only with `?csp=strict`, so that step 1 (does it paginate)
 *   and step 2 (does it paginate under the real policy) fail separately and legibly.
 */
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const PORT = Number(process.env.PORT ?? 3200);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.epub': 'application/epub+zip',
  '.json': 'application/json; charset=utf-8',
};

/**
 * The policy the real `/reader-sandbox.html` would carry, in the shape `next.config.mjs` already
 * emits for the addon sandbox (ADR-0010 §3). `script-src` has no `'self'`: on an opaque origin
 * `'self'` matches nothing, which is why the addon sandbox injects its code as a `blob:` instead.
 */
const STRICT_CSP = [
  'sandbox allow-scripts',
  "default-src 'none'",
  "script-src 'unsafe-inline' blob:",
  "style-src 'unsafe-inline' blob:",
  'img-src blob: data:',
  'font-src blob: data:',
  "connect-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ');

/**
 * Every request the hostile fixture manages to make. This is the ground truth for "did the book's
 * script run": a page can lie about its own state, but a request either arrived here or it did not.
 */
const beacons = [];

/**
 * The policy a same-origin `/read` route could carry in the fallback branch. The load-bearing part
 * is `script-src 'self'` with no `blob:` and no `'unsafe-inline'`: foliate hands each section to
 * the content frame as a `blob:` document, and a blob: document inherits the policy of whoever
 * created it — so if that inheritance works, the book's own scripts have no source they can be
 * served from, whatever the frame's sandbox attribute happens to say.
 */
const ROUTE_CSP = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'unsafe-inline' blob: data:",
  'img-src blob: data:',
  'font-src blob: data:',
  "connect-src 'self'",
  'frame-src blob:',
  "base-uri 'none'",
  "form-action 'none'",
].join('; ');

createServer((request, response) => {
  const url = new URL(request.url ?? '/', `http://localhost:${PORT}`);
  const path = url.pathname === '/' ? '/host.html' : url.pathname;

  if (path === '/__beacon') {
    beacons.push(url.searchParams.get('via') ?? 'unknown');
    response.writeHead(204, { 'Access-Control-Allow-Origin': '*' });
    response.end();
    return;
  }
  if (path === '/__beacons') {
    const body = JSON.stringify(beacons);
    response.writeHead(200, {
      'Content-Type': 'application/json',
      'Content-Length': String(Buffer.byteLength(body)),
      'Access-Control-Allow-Origin': '*',
    });
    response.end(body);
    return;
  }
  if (path === '/__beacons/reset') {
    beacons.length = 0;
    response.writeHead(204, { 'Access-Control-Allow-Origin': '*' });
    response.end();
    return;
  }
  const file = join(ROOT, normalize(path).replace(/^(\.\.[/\\])+/, ''));

  let size;
  try {
    size = statSync(file).size;
  } catch {
    response.writeHead(404, { 'Access-Control-Allow-Origin': '*' });
    response.end('not found');
    return;
  }

  const headers = {
    'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream',
    'Content-Length': String(size),
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store',
  };
  const csp = url.searchParams.get('csp');
  if (path === '/sandbox.html' && csp === 'strict') headers['Content-Security-Policy'] = STRICT_CSP;
  if (path === '/sandbox.html' && csp === 'route') headers['Content-Security-Policy'] = ROUTE_CSP;

  response.writeHead(200, headers);
  createReadStream(file).pipe(response);
}).listen(PORT, () => {
  console.log(`spike server on http://localhost:${PORT}`);
});
