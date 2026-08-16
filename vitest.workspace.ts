import { fileURLToPath } from 'node:url';
import { defineWorkspace } from 'vitest/config';

/**
 * Every workspace package, resolved to its **source** rather than to its build output.
 *
 * Without this, `pnpm test` works only after `pnpm build`: each package's `main` points at
 * `dist/index.js`, which does not exist in a fresh clone, and 33 test files fail to load with
 * "Failed to resolve entry for package @golden/…" before a single assertion runs. That is what CI
 * had been reporting — on `main` as well as on branches — and it is why the failure looks like 33
 * broken files rather than one broken assumption.
 *
 * Source, not `dist`, is also the right target for unit tests: they should fail on the code that was
 * written, not on the last build somebody happened to have lying around.
 */
const workspaceSource = (name: string): string =>
  fileURLToPath(new URL(`./packages/${name}/src/index.ts`, import.meta.url));

const alias = {
  '@golden/addons': workspaceSource('addons'),
  '@golden/application': workspaceSource('application'),
  '@golden/contracts': workspaceSource('contracts'),
  '@golden/domain': workspaceSource('domain'),
  '@golden/infrastructure': workspaceSource('infrastructure'),
  '@golden/plugins': workspaceSource('plugins'),
  '@golden/reader': workspaceSource('reader'),
};

// Three projects mirror docs/rules.md §5 test levels (E2E is Playwright, run separately via
// `pnpm test:e2e`, not part of this workspace).
//
// Coverage `include`/`thresholds` are deliberately NOT configured here. In Vitest's workspace
// mode, per-project `test.coverage.include` does not reliably restrict the merged report — it
// still lists every file loaded anywhere during the run (verified empirically: apps/api and
// even prototype/ files showed up despite an `include: ['packages/domain/src/**']` here). The
// same restriction passed as a CLI flag (`--coverage.include=...`) works correctly. So
// `pnpm test:coverage` (package.json) passes it that way instead — see the comment there for
// why domain-only, ≥90%, is the current scope.
export default defineWorkspace([
  {
    test: {
      name: 'unit',
      include: [
        'packages/*/src/**/*.test.ts',
        'apps/*/src/**/*.test.ts',
        // Everything under a package's `test/` except the port contract suites, which the
        // `contract` project below owns — running them in both would double every assertion.
        'packages/*/test/**/*.test.ts',
      ],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.integration.test.ts',
        'packages/*/test/contract/**',
      ],
      environment: 'node',
    },
    resolve: { alias },
  },
  {
    test: {
      name: 'contract',
      include: ['packages/*/test/contract/**/*.test.ts'],
      exclude: ['**/node_modules/**', '**/dist/**'],
      environment: 'node',
    },
    resolve: { alias },
  },
  {
    test: {
      name: 'integration',
      include: ['**/*.integration.test.ts'],
      exclude: ['**/node_modules/**', '**/dist/**'],
      environment: 'node',
      // Testcontainers boots real Postgres/Redis per docs/rules.md §5 — give it room.
      testTimeout: 60_000,
      hookTimeout: 60_000,
      fileParallelism: false,
    },
    resolve: { alias },
  },
]);
