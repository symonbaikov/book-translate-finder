import { defineWorkspace } from 'vitest/config';

// Three projects mirror docs/rules.md §5 test levels (E2E is Playwright, run separately via
// `pnpm test:e2e`, not part of this workspace).
export default defineWorkspace([
  {
    test: {
      name: 'unit',
      include: ['packages/*/src/**/*.test.ts', 'apps/*/src/**/*.test.ts'],
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
