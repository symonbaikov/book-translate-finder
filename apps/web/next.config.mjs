import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * The Content-Security-Policy for the addon sandbox, built from the sandbox document itself.
 *
 * The hash is computed here rather than written down because a hash written down is a hash that
 * goes stale: someone edits `public/addon-sandbox.html`, the header still names yesterday's script,
 * and the sandbox stops booting for a reason nobody connects to the edit. Reading the file closes
 * that gap entirely — there is no second copy to drift.
 *
 * What each directive is for (docs/adr/0010-addon-engine.md §3):
 *
 * - `sandbox allow-scripts` — the opaque origin, asserted by the document as well as by the
 *   `sandbox` attribute on the iframe. Two independent statements of the property everything else
 *   rests on.
 * - `script-src 'sha256-…' blob:` — exactly the bootstrap in that file, plus the worker's blob.
 *   No `'self'`: on an opaque origin it matches nothing, and no `'unsafe-inline'`, which would
 *   permit any inline script rather than the one we wrote.
 * - `connect-src 'none'` — the addon cannot open a connection of its own. This is what makes
 *   `mediatedFetch` unavoidable rather than merely polite.
 * - everything else `'none'` — the document renders nothing and needs nothing.
 */
function addonSandboxCsp() {
  const html = readFileSync(new URL('./public/addon-sandbox.html', import.meta.url), 'utf8');
  const script = /<script>([\s\S]*?)<\/script>/.exec(html);
  if (!script?.[1]) {
    throw new Error('public/addon-sandbox.html no longer contains an inline bootstrap to hash.');
  }
  const hash = createHash('sha256').update(script[1], 'utf8').digest('base64');
  return [
    'sandbox allow-scripts',
    "default-src 'none'",
    `script-src 'sha256-${hash}' blob:`,
    'worker-src blob:',
    "connect-src 'none'",
    "style-src 'none'",
    "img-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
  ].join('; ');
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Self-hosting (docs/architecture.md §9.1): a standalone build copies only the traced
  // production dependencies into `.next/standalone`, avoiding a full node_modules layer in the
  // runtime image.
  output: 'standalone',
  experimental: {
    // Without this, Next's file tracer only looks inside apps/web and misses the workspace
    // dependency on @golden/contracts (a pnpm-symlinked sibling package) — it would build fine but
    // the standalone output would be missing that package at runtime. Still `experimental` in
    // Next 14 (this project's version) — it only moved to the top level in Next 15.
    outputFileTracingRoot: fileURLToPath(new URL('../..', import.meta.url)),
  },
  async headers() {
    return [
      {
        source: '/addon-sandbox.html',
        headers: [
          { key: 'Content-Security-Policy', value: addonSandboxCsp() },
          // Nothing else may frame it, and it is never a top-level page.
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          // It is a fixed document; a stale copy of it is a sandbox that no longer matches the
          // header's hash, which fails closed but confusingly.
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ];
  },
};

export { addonSandboxCsp };
export default nextConfig;
