-- Trigram GIN index on edition.title, powering the edition-title arm of work search
-- (pg-work-search-adapter.ts). Hand-written for the same reason as 0001_trigram_indexes.sql:
-- Drizzle's schema builder has no first-class gin_trgm_ops support. Found live in Phase 3:
-- a work stored under its original-language title was unfindable by the English title its own
-- translations carry — searching edition titles fixes cross-language queries, and without this
-- index that search arm would be a sequential scan over the editions table.
CREATE INDEX IF NOT EXISTS "edition_title_trgm_idx" ON "edition" USING gin ("title" gin_trgm_ops);
