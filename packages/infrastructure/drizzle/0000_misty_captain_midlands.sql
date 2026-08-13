CREATE TABLE IF NOT EXISTS "edition" (
	"id" text PRIMARY KEY NOT NULL,
	"work_id" text NOT NULL,
	"title" text NOT NULL,
	"language" varchar(2) NOT NULL,
	"translator" text,
	"translated_from" varchar(2),
	"publisher" text,
	"year" integer,
	"isbn13" varchar(13),
	"natural_key" varchar(64) NOT NULL,
	CONSTRAINT "edition_natural_key_key" UNIQUE("natural_key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "external_ref" (
	"id" text PRIMARY KEY NOT NULL,
	"source_name" text NOT NULL,
	"external_id" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	CONSTRAINT "external_ref_source_external_key" UNIQUE("source_name","external_id"),
	CONSTRAINT "external_ref_entity_type_check" CHECK ("external_ref"."entity_type" IN ('work', 'edition'))
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "idempotency_key" (
	"key" text NOT NULL,
	"endpoint" text NOT NULL,
	"request_hash" text NOT NULL,
	"response_body" jsonb NOT NULL,
	"status_code" integer NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "idempotency_key_key_endpoint_pk" PRIMARY KEY("key","endpoint")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "language" (
	"code" varchar(2) PRIMARY KEY NOT NULL,
	"name_ru" text NOT NULL,
	"name_en" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "source_link" (
	"id" text PRIMARY KEY NOT NULL,
	"edition_id" text NOT NULL,
	"type" text NOT NULL,
	"url" text NOT NULL,
	"url_hash" varchar(64) NOT NULL,
	"provider" text NOT NULL,
	"rights_status" text NOT NULL,
	"is_legal_free" boolean NOT NULL,
	"verified_at" timestamp with time zone NOT NULL,
	CONSTRAINT "source_link_composite_key" UNIQUE("edition_id","provider","type","url_hash"),
	CONSTRAINT "source_link_type_check" CHECK ("source_link"."type" IN ('download', 'buy', 'borrow')),
	CONSTRAINT "source_link_rights_status_check" CHECK ("source_link"."rights_status" IN ('public_domain', 'open_license', 'copyrighted', 'unknown')),
	CONSTRAINT "source_link_download_is_legal_free_check" CHECK ("source_link"."type" != 'download' OR "source_link"."is_legal_free" = true)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sync_log" (
	"id" text PRIMARY KEY NOT NULL,
	"source_name" text NOT NULL,
	"work_id" text,
	"job_id" text,
	"fetched_at" timestamp with time zone NOT NULL,
	"status" text NOT NULL,
	"error" text,
	CONSTRAINT "sync_log_status_check" CHECK ("sync_log"."status" IN ('ok', 'error'))
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "work" (
	"id" text PRIMARY KEY NOT NULL,
	"original_title" text NOT NULL,
	"original_language" varchar(2) NOT NULL,
	"author" text NOT NULL,
	"first_published_year" integer,
	"natural_key" varchar(64) NOT NULL,
	"synced_at" timestamp with time zone NOT NULL,
	CONSTRAINT "work_natural_key_key" UNIQUE("natural_key")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "edition" ADD CONSTRAINT "edition_work_id_work_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."work"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "edition" ADD CONSTRAINT "edition_language_language_code_fk" FOREIGN KEY ("language") REFERENCES "public"."language"("code") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "edition" ADD CONSTRAINT "edition_translated_from_language_code_fk" FOREIGN KEY ("translated_from") REFERENCES "public"."language"("code") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "source_link" ADD CONSTRAINT "source_link_edition_id_edition_id_fk" FOREIGN KEY ("edition_id") REFERENCES "public"."edition"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sync_log" ADD CONSTRAINT "sync_log_work_id_work_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."work"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "work" ADD CONSTRAINT "work_original_language_language_code_fk" FOREIGN KEY ("original_language") REFERENCES "public"."language"("code") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "edition_isbn13_key" ON "edition" USING btree ("isbn13") WHERE "edition"."isbn13" IS NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "edition_work_id_language_idx" ON "edition" USING btree ("work_id","language");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "source_link_edition_id_idx" ON "source_link" USING btree ("edition_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sync_log_source_fetched_idx" ON "sync_log" USING btree ("source_name","fetched_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "work_synced_at_idx" ON "work" USING btree ("synced_at");