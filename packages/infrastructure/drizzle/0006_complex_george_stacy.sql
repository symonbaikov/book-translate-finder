ALTER TABLE "edition" ADD COLUMN "pages" integer;--> statement-breakpoint
ALTER TABLE "edition" ADD COLUMN "binding" text;--> statement-breakpoint
ALTER TABLE "work" ADD COLUMN "subjects" jsonb DEFAULT '[]'::jsonb NOT NULL;