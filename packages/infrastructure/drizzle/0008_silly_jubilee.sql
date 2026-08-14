ALTER TABLE "source_link" DROP CONSTRAINT "source_link_type_check";--> statement-breakpoint
ALTER TABLE "source_link" DROP CONSTRAINT "source_link_download_is_legal_free_check";--> statement-breakpoint
ALTER TABLE "source_link" ADD CONSTRAINT "source_link_type_check" CHECK ("source_link"."type" IN ('download', 'buy', 'borrow', 'listen'));--> statement-breakpoint
ALTER TABLE "source_link" ADD CONSTRAINT "source_link_download_is_legal_free_check" CHECK ("source_link"."type" NOT IN ('download', 'listen') OR "source_link"."is_legal_free" = true);