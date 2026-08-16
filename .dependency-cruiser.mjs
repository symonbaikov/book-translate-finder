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
      name: 'reader-is-a-leaf',
      comment:
        'packages/reader is bundled into the browser and must depend on no other workspace package — same rule, and the same reason, as packages/addons and packages/plugins (docs/adr/0013-client-side-reader.md §5).',
      severity: 'error',
      from: { path: '^packages/reader/src' },
      to: {
        path: '^(packages/(domain|application|infrastructure|contracts|plugins|addons)|apps)/',
      },
    },
    {
      name: 'reader-never-on-the-server',
      comment:
        "The book is the reader's: their browser fetches it, their browser renders it, and this instance never learns that it exists (docs/adr/0013-client-side-reader.md §1). Nothing that executes server-side may import packages/reader, which is what makes that a build failure rather than a promise.",
      severity: 'error',
      from: { path: '^(apps/(api|worker)|packages/(domain|application|infrastructure))/' },
      to: { path: '^packages/reader/' },
    },
    {
      name: 'reader-surface-never-calls-this-instance',
      comment:
        'The reading surface talks to the book and to browser storage, and to nothing else. An import of the API client here is how a "just the resume position" endpoint gets born, and that endpoint would end ADR-0013 §1.',
      severity: 'error',
      from: { path: '^apps/web/src/(app/read|components/reader)/' },
      to: { path: '^apps/web/src/lib/(api-client|auth-client)' },
    },
    {
      name: 'reader-vendor-has-one-door',
      comment:
        'The vendored copy of foliate-js carries a patch the reader depends on for its safety (packages/reader/vendor/VENDOR.md). It is reached through packages/reader/src/foliate.ts and nowhere else — a second import path is a second place to pick up an unpatched or differently-configured renderer.',
      severity: 'error',
      // `dist` is in the list because a workspace import of `@golden/reader` resolves to the built
      // entry point, so the compiled `src/foliate.ts` appears here as `dist/foliate.js` — the same
      // allowed import, seen after compilation. Excluding `dist` from the cruise instead would have
      // been worse: it is also where `addons-never-on-the-server` and its siblings catch things.
      from: { pathNot: '^packages/reader/(src|vendor|dist)/' },
      to: { path: '^packages/reader/vendor/' },
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
