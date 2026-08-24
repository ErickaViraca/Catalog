-- Un foreignKey() en Drizzle NO crea índice — solo el lado referenciado
-- (la primary key) queda indexado automáticamente. Sin estos índices,
-- cada filtro por categoría/marca en /shop y cada resolución de imagen
-- principal (product_images, en cada carga de /products/[slug] y en
-- cada listado del catálogo/admin) hacía sequential scan completo.
CREATE INDEX IF NOT EXISTS "product_images_product_id_idx" ON "product_images" ("product_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_category_id_idx" ON "products" ("category_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_brand_id_idx" ON "products" ("brand_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_active_idx" ON "products" ("active");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_is_deleted_idx" ON "products" ("is_deleted");
