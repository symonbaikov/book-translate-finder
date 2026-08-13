import { defineWorkspace } from 'vitest/config';

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
        'packages/*/test/fakes/**/*.test.ts',
      ],
      exclude: ['**/node_modules/**', '**/dist/**', '**/*.integration.test.ts'],
      environment: 'node',
    },
  },
  {
    test: {
      name: 'contract',
      include: ['packages/*/test/contract/**/*.test.ts'],
      exclude: ['**/node_modules/**', '**/dist/**'],
      environment: 'node',
    },
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
  },
]);
