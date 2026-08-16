/**
 * Re-create `packages/reader/vendor/foliate` from upstream, patched.
 *
 *   node packages/reader/scripts/vendor.mjs            # re-vendor at PINNED_COMMIT
 *   node packages/reader/scripts/vendor.mjs --check    # verify the committed tree, change nothing
 *
 * The tree it produces **is committed**. foliate-js is not published to npm and recommends a git
 * submodule; a build that clones GitHub is a build that fails in an air-gapped Docker image, and
 * self-hosting this project is supposed to be three commands (CLAUDE.md).
 *
 * ## The patch, and why it is code rather than a .patch file
 *
 * foliate renders each section into an iframe carrying `sandbox="allow-same-origin allow-scripts"`.
 * That is a deliberate upstream choice — scripted EPUBs are a real format feature — and it is one
 * this project cannot take: spike 11.1 measured a hostile EPUB escaping four ways in three engines
 * through exactly that attribute (docs/research/reader-sandbox-spike.md). ADR-0013 §3 removes
 * `allow-scripts` and keeps `allow-same-origin`, which the paginator needs in order to measure the
 * document it lays out.
 *
 * The edit is expressed as an exact-match replacement that **fails loudly when it does not apply**.
 * A `.patch` file applied with fuzz can land in the wrong place or silently no-op on a version bump;
 * this cannot. If upstream moves the line, this script stops and says so, which is the moment a
 * human should be re-reading the diff anyway.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

/** foliate-js @ main, 2026-05-01. Bumping this means re-running the hostile fixture, not just this script. */
const PINNED_COMMIT = '78914aef4466eb960965702401634c2cb348e9b1';
const UPSTREAM = 'https://github.com/johnfactotum/foliate-js.git';

/**
 * The tree this script produces, hashed. `--check` compares against it, which is what turns
 * "vendored, pinned and patched" into something CI can verify without the network.
 *
 * It earned its place immediately: `prettier --write packages/reader` reformatted the whole vendored
 * tree the first time it ran over it — semicolons, indentation, the lot — leaving code that still
 * behaved but was no longer what upstream published. `.prettierignore` and the ESLint ignores now
 * keep tools out; this is what notices when something gets past them.
 */
const EXPECTED_TREE_SHA = 'fdf09fa3aa710789d9a496e7e4cccf98be50ec64a6a5534973feb8b6fe60edae';

const PACKAGE_ROOT = fileURLToPath(new URL('..', import.meta.url));
const VENDOR_ROOT = join(PACKAGE_ROOT, 'vendor', 'foliate');

/**
 * Both places upstream creates a frame for book content. `paginator.js` is the reflowable path and
 * `fixed-layout.js` the pre-paginated one; patching only the first would leave fixed-layout EPUBs
 * running scripts, which is the same hole with a narrower entrance.
 */
const PATCHES = [
  {
    file: 'paginator.js',
    from: `this.#iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts')`,
    to: `this.#iframe.setAttribute('sandbox', 'allow-same-origin') // golden-library: ADR-0013 §3`,
  },
  {
    file: 'fixed-layout.js',
    from: `iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts')`,
    to: `iframe.setAttribute('sandbox', 'allow-same-origin') // golden-library: ADR-0013 §3`,
  },
];

/** PDF is out of scope (ADR-0013 §8), and PDF.js is a second rendering engine's worth of bytes. */
const DROP = [
  'vendor/pdfjs',
  'pdf.js',
  'reader.js',
  'reader.html',
  'tests',
  'rollup',
  'rollup.config.js',
  'eslint.config.js',
  'package.json',
  'package-lock.json',
];

function treeHash(root) {
  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir).sort()) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else files.push(full);
    }
  };
  walk(root);
  const hash = createHash('sha256');
  for (const file of files) {
    hash.update(relative(root, file).replaceAll('\\', '/'));
    hash.update('\0');
    hash.update(readFileSync(file));
    hash.update('\0');
  }
  return hash.digest('hex');
}

function applyPatches(root) {
  for (const patch of PATCHES) {
    const path = join(root, patch.file);
    const source = readFileSync(path, 'utf8');
    const occurrences = source.split(patch.from).length - 1;
    if (occurrences !== 1) {
      throw new Error(
        `${patch.file}: expected exactly one occurrence of the sandbox attribute to patch, found ` +
          `${occurrences}. Upstream has moved it — re-derive the patch by hand and re-read ` +
          `docs/adr/0013-client-side-reader.md §3 before trusting the result.`,
      );
    }
    writeFileSync(path, source.replace(patch.from, patch.to));
  }
}

if (process.argv.includes('--check')) {
  // Cheap enough to run in CI: it does not need the network, only the committed tree.
  //
  // Checked as "the patched line is there and the unpatched one is not", rather than by grepping
  // for `allow-scripts`: upstream's comment above the line mentions the token and is deliberately
  // kept (VENDOR.md), so a naive grep reports a tree that is in fact patched. It did, once.
  for (const patch of PATCHES) {
    const source = readFileSync(join(VENDOR_ROOT, patch.file), 'utf8');
    if (source.includes(patch.from) || !source.includes(patch.to)) {
      throw new Error(`${patch.file} is not patched — see docs/adr/0013-client-side-reader.md §3.`);
    }
  }
  const actual = treeHash(VENDOR_ROOT);
  if (actual !== EXPECTED_TREE_SHA) {
    throw new Error(
      `The vendored tree has been edited: expected sha256 ${EXPECTED_TREE_SHA}, found ${actual}. ` +
        'Re-run this script without --check to restore it, or update EXPECTED_TREE_SHA if the ' +
        'change was deliberate — and say why in vendor/VENDOR.md if so.',
    );
  }
  console.log(`vendor ok — patched, tree sha256 ${actual.slice(0, 16)}…`);
  process.exit(0);
}

const scratch = mkdtempSync(join(tmpdir(), 'foliate-'));
try {
  execFileSync('git', ['clone', '--quiet', UPSTREAM, scratch], { stdio: 'inherit' });
  execFileSync('git', ['-C', scratch, 'checkout', '--quiet', PINNED_COMMIT], { stdio: 'inherit' });
  rmSync(join(scratch, '.git'), { recursive: true, force: true });
  for (const path of DROP) rmSync(join(scratch, path), { recursive: true, force: true });
  applyPatches(scratch);

  rmSync(VENDOR_ROOT, { recursive: true, force: true });
  cpSync(scratch, VENDOR_ROOT, { recursive: true });
  console.log(`foliate-js @ ${PINNED_COMMIT} → vendor/foliate (patched)`);
  console.log(`tree sha256 ${treeHash(VENDOR_ROOT)}`);
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
