ALTER TABLE "products" ADD COLUMN "price_bs" numeric(10, 2) DEFAULT '0' NOT NULL;
--> statement-breakpoint
-- Backfill: price_bs = price * companies.dollar_price_bs (fila única) para
-- que los productos existentes no queden en 0 hasta la próxima edición.
UPDATE "products"
SET "price_bs" = ROUND("products"."price" * "companies"."dollar_price_bs", 2)
FROM "companies";
