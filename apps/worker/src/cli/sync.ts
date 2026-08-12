// Placeholder for `pnpm sync -- --source=<name> --work=<workId>` (documented in CLAUDE.md).
// Real implementation lands in Phase 1.3 with the BullMQ `sync` queue and the
// `SyncWorkFromSource` use case (docs/plan.md §1.3) — this stub fails loudly instead of
// silently doing nothing, so a premature call is obvious rather than misleading.
console.error(
  'pnpm sync: not implemented yet — BullMQ sync queue lands in Phase 1.3 (see docs/plan.md §1.3).',
);
process.exit(1);
