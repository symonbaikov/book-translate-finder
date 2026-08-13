## What this PR changes

<!-- One meaningful change per PR. Link the issue, if any. -->

## Checklist

- [ ] `pnpm lint && pnpm typecheck && pnpm boundaries && pnpm test` pass locally
- [ ] New logic is covered by tests
- [ ] Write operations invoked by jobs/retries are idempotent (no `INSERT` without a conflict strategy)
- [ ] Does not add scraping or shadow library integrations ([CONTRIBUTING.md](../CONTRIBUTING.md) — such PRs are closed)
- [ ] Does not add dependencies to `packages/domain`
- [ ] Secrets only via environment variables
