import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * The vendored renderer is patched, and this is what fails when it stops being.
 *
 * Spike 11.1 measured a hostile EPUB escaping four ways in three engines through
 * `sandbox="allow-same-origin allow-scripts"`, which is what upstream sets on every frame it renders
 * book content into (docs/research/reader-sandbox-spike.md). ADR-0013 §3 makes removing
 * `allow-scripts` one of the two walls this reader stands on. A vendor bump silently restoring it is
 * the failure mode that test exists to make loud: nothing else in the suite would notice, and the
 * symptom in production is a book that quietly makes requests.
 *
 * It lives in `test/` rather than next to the source because it reads files off disk, and
 * `packages/reader` compiles with `types: []` — the package itself must never acquire a Node API.
 */
const VENDOR = fileURLToPath(new URL('../vendor/foliate', import.meta.url));

function everyJsFile(root: string): string[] {
  return readdirSync(root).flatMap((entry) => {
    const full = join(root, entry);
    if (statSync(full).isDirectory()) return everyJsFile(full);
    return full.endsWith('.js') ? [full] : [];
  });
}

describe('vendored foliate-js', () => {
  it('grants allow-scripts to nothing, anywhere in the tree', () => {
    // Comments are stripped first, and deliberately: upstream's note explaining why it wanted
    // `allow-scripts` is worth keeping in the tree — it is the reason WebKit input handling had to
    // be re-tested (VENDOR.md). What must not survive is the attribute value itself.
    const offenders = everyJsFile(VENDOR).filter((file) =>
      readFileSync(file, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(^|[^:])\/\/.*$/gm, '$1')
        .includes('allow-scripts'),
    );
    expect(offenders).toEqual([]);
  });

  it('asks the engine policy in both places it renders book content, and falls back to the safe value', () => {
    // Two properties, and both matter. `allow-same-origin` must survive — without it the paginator
    // cannot measure the document it lays out and the reader silently renders nothing (spike 11.1).
    // And the fallback in the `??` must be the strict value, so a page that forgets to install a
    // policy gets the safe frame rather than the permissive one.
    for (const file of ['paginator.js', 'fixed-layout.js']) {
      const source = readFileSync(join(VENDOR, file), 'utf8');
      expect(source, file).toContain(
        `globalThis.__goldenReaderContentFrameSandbox ?? 'allow-same-origin'`,
      );
    }
  });

  it('is byte-for-byte what the vendor script produced', () => {
    // A formatter got in here once — `prettier --write packages/reader` reformatted every vendored
    // file, leaving code that behaved the same and was no longer upstream's. The ignores keep tools
    // out; this is what notices when one gets past them.
    execFileSync(process.execPath, [
      fileURLToPath(new URL('../scripts/vendor.mjs', import.meta.url)),
      '--check',
    ]);
  });

  it('carries the licence it is used under', () => {
    expect(readFileSync(join(VENDOR, 'LICENSE'), 'utf8')).toContain('MIT');
  });

  it('does not ship the PDF engine that is out of scope', () => {
    const files = everyJsFile(VENDOR).map((file) => file.slice(VENDOR.length + 1));
    expect(files).not.toContain('pdf.js');
    expect(files.some((file) => file.startsWith('vendor/pdfjs'))).toBe(false);
  });
});
