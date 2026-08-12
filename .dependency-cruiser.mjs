/** @type {import('dependency-cruiser').IConfiguration} */
export default {
  forbidden: [
    {
      name: 'domain-zero-deps',
      comment:
        'packages/domain must have zero dependencies on anything outside itself — see docs/architecture.md §2.2 and CLAUDE.md.',
      severity: 'error',
      from: { path: '^packages/domain/src' },
      to: {
        path: '^(packages/(application|infrastructure|contracts)|apps)/',
      },
    },
    {
      name: 'domain-no-external-packages',
      comment: 'packages/domain must not import any npm package, only relative modules.',
      severity: 'error',
      from: { path: '^packages/domain/src' },
      to: { dependencyTypes: ['npm', 'npm-dev', 'npm-optional', 'npm-peer', 'npm-bundled'] },
    },
    {
      name: 'application-only-domain',
      comment:
        'packages/application may depend on domain only, not on infrastructure/contracts/apps.',
      severity: 'error',
      from: { path: '^packages/application/src' },
      to: { path: '^(packages/(infrastructure|contracts)|apps)/' },
    },
    {
      name: 'contracts-isolated',
      comment: 'packages/contracts must not depend on domain/application/infrastructure/apps.',
      severity: 'error',
      from: { path: '^packages/contracts/src' },
      to: { path: '^(packages/(domain|application|infrastructure)|apps)/' },
    },
    {
      name: 'infrastructure-no-apps',
      comment:
        'packages/infrastructure must not depend on apps/* (composition root is downstream of it).',
      severity: 'error',
      from: { path: '^packages/infrastructure/src' },
      to: { path: '^apps/' },
    },
    {
      name: 'web-no-domain-application-infrastructure',
      comment:
        'apps/web talks only to the HTTP API and packages/contracts — it must not import domain, application or infrastructure directly (docs/architecture.md §2.5).',
      severity: 'error',
      from: { path: '^apps/web/src' },
      to: { path: '^packages/(domain|application|infrastructure)/' },
    },
    {
      name: 'no-circular',
      comment:
        'Circular dependencies make the dependency direction (and idempotency reasoning) unverifiable.',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.base.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
    reporterOptions: {
      text: { highlightFocused: true },
    },
  },
};
