// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

// Layer-boundary enforcement (docs/architecture.md §2) lives in .dependency-cruiser.mjs, not
// here: it resolves workspace-package imports (e.g. `@golden/infrastructure`) against real files,
// which eslint-plugin-boundaries could not do reliably in this pnpm + ESM + project-references
// setup (verified: it silently passed a deliberately introduced application -> infrastructure
// import that dependency-cruiser correctly failed on). Run `pnpm boundaries` for that check.

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/*.tsbuildinfo',
      'docs/source/**',
      'pnpm-lock.yaml',
      // Throwaway spikes (docs/plan.md 11.1). They are browser code, they carry a fetched copy of
      // somebody else's library, and they are deleted once the decision they exist for is taken —
      // linting them would mean maintaining code whose whole point is not to be maintained.
      'prototype/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    // Only domain/application are barred from touching I/O directly (docs/rules.md §3) —
    // apps/infrastructure legitimately need Node's raw APIs (Fastify request types, fs, etc).
    files: ['packages/domain/src/**/*.ts', 'packages/application/src/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['node:fs', 'fs', 'node:net', 'node:http', 'node:https'],
              message:
                'domain/application must not touch I/O directly — go through a port (docs/rules.md §3).',
            },
          ],
          paths: [
            {
              name: 'node:crypto',
              importNames: [
                'randomUUID',
                'randomBytes',
                'randomInt',
                'randomFillSync',
                'getRandomValues',
              ],
              message:
                'Non-deterministic — use the IdGenerator port (docs/rules.md §3), never call it directly from domain/application. `createHash` for deterministic natural-key hashing is allowed.',
            },
          ],
        },
      ],
    },
  },
  prettier,
);
