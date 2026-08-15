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
      name: 'plugins-is-a-leaf',
      comment:
        'packages/plugins is imported by apps/web (browser) and packages/infrastructure (Node) alike, so it must depend on no other workspace package — see docs/adr/0007-plugin-architecture.md.',
      severity: 'error',
      from: { path: '^packages/plugins/src' },
      to: { path: '^(packages/(domain|application|infrastructure|contracts)|apps)/' },
    },
    {
      name: 'addons-is-a-leaf',
      comment:
        'packages/addons is bundled into the browser and must depend on no other workspace package — see docs/adr/0010-addon-engine.md.',
      severity: 'error',
      from: { path: '^packages/addons/src' },
      to: { path: '^(packages/(domain|application|infrastructure|contracts|plugins)|apps)/' },
    },
    {
      name: 'addons-never-on-the-server',
      comment:
        'An addon is the reader\'s: it runs on their device or on its author\'s server, and this instance is not to learn about it (docs/adr/0010-addon-engine.md §6). Nothing that executes server-side may import packages/addons — that is what makes "zero knowledge" a build failure rather than a promise.',
      severity: 'error',
      from: { path: '^(apps/(api|worker)|packages/(domain|application|infrastructure))/' },
      to: { path: '^packages/addons/' },
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
        'apps/web talks to the HTTP API, packages/contracts, packages/plugins and packages/addons only — it must not import domain, application or infrastructure directly (docs/architecture.md §2.5). `plugins` is allowed because the client-side modules (OPDS, bookshop lookup) run in the browser by design and depend on nothing (docs/adr/0007); `addons` because the browser is the only place an addon may run at all (docs/adr/0010).',
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
