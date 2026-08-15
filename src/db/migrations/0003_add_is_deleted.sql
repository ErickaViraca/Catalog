ALTER TABLE "brands" ADD COLUMN "is_deleted" boolean DEFAULT false;
--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "is_deleted" boolean DEFAULT false;
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "is_deleted" boolean DEFAULT false;
