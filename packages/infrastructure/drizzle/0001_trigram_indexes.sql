-- Trigram GIN indexes for fuzzy search on work.original_title/author (docs/architecture.md §3.3).
-- Hand-written: Drizzle's schema builder (drizzle.config.ts / src/db/schema.ts) has no
-- first-class support for the gin_trgm_ops operator class, so this isn't generated from schema.ts
-- the way the rest of this migration set is — keep it in sync with schema.ts by hand if the
-- indexed columns ever change.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "work_original_title_trgm_idx" ON "work" USING gin ("original_title" gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "work_author_trgm_idx" ON "work" USING gin ("author" gin_trgm_ops);
