import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

/**
 * Drizzle schema mirroring docs/architecture.md §3.1. Unique constraints here ARE the
 * idempotency mechanism (docs/rules.md §2.2) — every write from a sync goes through
 * `ON CONFLICT ... DO UPDATE` against one of these, never a bare INSERT. Trigram indexes on
 * `work.original_title`/`author` (docs/architecture.md §3.3) are added via raw SQL in the
 * migration, not here — Drizzle's schema builder doesn't have first-class support for the
 * `gin_trgm_ops` operator class, and fighting that isn't worth it for one index pair.
 *
 * All id/reference columns are `text`, not Postgres's native `uuid` type — the domain's
 * `IdGenerator` port (packages/domain/src/ports/id-generator.port.ts) is explicit that "nothing
 * about this interface requires that specific format", and the real implementation will
 * generate UUIDv7 strings, which `text` stores fine. Native `uuid` would reject anything that
 * doesn't parse as a UUID, which conflicts with that port contract — caught by an actual
 * integration test failure (`invalid input syntax for type uuid: "work-1"`) when the shared
 * contract-suite from Phase 1.1 (which deliberately uses short, readable fake ids) ran against
 * real Postgres for the first time.
 */

export const language = pgTable('language', {
  code: varchar('code', { length: 2 }).primaryKey(),
  nameRu: text('name_ru').notNull(),
  nameEn: text('name_en').notNull(),
});

export const work = pgTable(
  'work',
  {
    id: text('id').primaryKey(),
    originalTitle: text('original_title').notNull(),
    originalLanguage: varchar('original_language', { length: 2 })
      .notNull()
      .references(() => language.code),
    author: text('author').notNull(),
    firstPublishedYear: integer('first_published_year'),
    description: text('description'),
    coverUrl: text('cover_url'),
    /** Genre tags from the source. Stored as a JSON array rather than a join table: they are
     * free contributor text, never queried relationally, and always read whole with the work. */
    subjects: jsonb('subjects').$type<string[]>().notNull().default([]),
    naturalKey: varchar('natural_key', { length: 64 }).notNull(),
    syncedAt: timestamp('synced_at', { withTimezone: true }).notNull(),
  },
  (table) => [
    unique('work_natural_key_key').on(table.naturalKey),
    index('work_synced_at_idx').on(table.syncedAt),
  ],
);

export const edition = pgTable(
  'edition',
  {
    id: text('id').primaryKey(),
    workId: text('work_id')
      .notNull()
      .references(() => work.id),
    title: text('title').notNull(),
    language: varchar('language', { length: 2 })
      .notNull()
      .references(() => language.code),
    translator: text('translator'),
    translatedFrom: varchar('translated_from', { length: 2 }).references(() => language.code),
    publisher: text('publisher'),
    year: integer('year'),
    isbn13: varchar('isbn13', { length: 13 }),
    coverUrl: text('cover_url'),
    pages: integer('pages'),
    binding: text('binding'),
    naturalKey: varchar('natural_key', { length: 64 }).notNull(),
  },
  (table) => [
    unique('edition_natural_key_key').on(table.naturalKey),
    // Partial unique — deliberately not just a plain unique index, since Postgres treats every
    // NULL as distinct: without WHERE isbn13 IS NOT NULL, multiple NULLs would still be allowed
    // (fine), but a plain unique() would only reject *duplicate non-null* values anyway — this
    // makes that explicit rather than relying on incidental NULL-handling semantics.
    uniqueIndex('edition_isbn13_key')
      .on(table.isbn13)
      .where(sql`${table.isbn13} IS NOT NULL`),
    index('edition_work_id_language_idx').on(table.workId, table.language),
  ],
);

export const sourceLink = pgTable(
  'source_link',
  {
    id: text('id').primaryKey(),
    editionId: text('edition_id')
      .notNull()
      .references(() => edition.id),
    type: text('type').notNull(),
    url: text('url').notNull(),
    urlHash: varchar('url_hash', { length: 64 }).notNull(),
    provider: text('provider').notNull(),
    rightsStatus: text('rights_status').notNull(),
    isLegalFree: boolean('is_legal_free').notNull(),
    /** `epub`/`txt`/… for downloads; null for buy/borrow links, which land on a page not a file. */
    format: text('format'),
    verifiedAt: timestamp('verified_at', { withTimezone: true }).notNull(),
  },
  (table) => [
    unique('source_link_composite_key').on(
      table.editionId,
      table.provider,
      table.type,
      table.urlHash,
    ),
    index('source_link_edition_id_idx').on(table.editionId),
    check('source_link_type_check', sql`${table.type} IN ('download', 'buy', 'borrow')`),
    check(
      'source_link_rights_status_check',
      sql`${table.rightsStatus} IN ('public_domain', 'open_license', 'copyrighted', 'unknown')`,
    ),
    // docs/rules.md §3 CHECK: a download link can never be marked not-legally-free — LinkPolicy
    // (docs/legal-policy.md I-1) already guarantees this at the domain layer; this is the same
    // invariant enforced again at the storage boundary, independent of application code.
    check(
      'source_link_download_is_legal_free_check',
      sql`${table.type} != 'download' OR ${table.isLegalFree} = true`,
    ),
  ],
);

export const externalRef = pgTable(
  'external_ref',
  {
    id: text('id').primaryKey(),
    sourceName: text('source_name').notNull(),
    externalId: text('external_id').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id').notNull(),
  },
  (table) => [
    unique('external_ref_source_external_key').on(table.sourceName, table.externalId),
    check('external_ref_entity_type_check', sql`${table.entityType} IN ('work', 'edition')`),
    // `findSourcesForEntity` (Phase 2, docs/plan.md §Phase 2) filters by entity_id — without this,
    // it's a full table scan; confirmed live via EXPLAIN ANALYZE at 66k synthetic rows (6.3ms and
    // climbing linearly with table size, called on every uncached GetWorkCard request).
    index('external_ref_entity_id_idx').on(table.entityId),
  ],
);

export const syncLog = pgTable(
  'sync_log',
  {
    id: text('id').primaryKey(),
    sourceName: text('source_name').notNull(),
    workId: text('work_id').references(() => work.id),
    jobId: text('job_id'),
    fetchedAt: timestamp('fetched_at', { withTimezone: true }).notNull(),
    status: text('status').notNull(),
    error: text('error'),
  },
  (table) => [
    index('sync_log_source_fetched_idx').on(table.sourceName, table.fetchedAt),
    check('sync_log_status_check', sql`${table.status} IN ('ok', 'error')`),
  ],
);

export const idempotencyKey = pgTable(
  'idempotency_key',
  {
    key: text('key').notNull(),
    endpoint: text('endpoint').notNull(),
    requestHash: text('request_hash').notNull(),
    responseBody: jsonb('response_body').notNull(),
    statusCode: integer('status_code').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.key, table.endpoint] })],
);
