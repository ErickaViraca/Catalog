# 🚀 Crear Tablas en Neon - Instrucciones Manuales

Debido a limitaciones de conectividad en el ambiente remoto, ejecuta este SQL manualmente en Neon.

## 📋 Pasos:

### 1. Ve a Neon Console
- URL: https://console.neon.tech/
- Selecciona tu proyecto: **neondb**
- Click en **SQL Editor**

### 2. Copia y ejecuta el siguiente SQL:

```sql
-- TABLA: BRANDS
CREATE TABLE "brands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo" text,
	"description" text,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "brands_name_unique" UNIQUE("name"),
	CONSTRAINT "brands_slug_unique" UNIQUE("slug")
);

CREATE UNIQUE INDEX "brands_slug_idx" ON "brands" USING btree ("slug");

-- TABLA: CATEGORIES
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"image" text,
	"parent_category_id" uuid,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "categories_name_unique" UNIQUE("name"),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);

ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_category_id_categories_id_fk" 
FOREIGN KEY ("parent_category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;

CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");

-- TABLA: PRODUCTS
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"sku" text NOT NULL,
	"category_id" uuid NOT NULL,
	"brand_id" uuid NOT NULL,
	"active" boolean DEFAULT true,
	"featured" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "products_slug_unique" UNIQUE("slug"),
	CONSTRAINT "products_sku_unique" UNIQUE("sku")
);

ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" 
FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_brands_id_fk" 
FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;

CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");
CREATE UNIQUE INDEX "products_sku_idx" ON "products" USING btree ("sku");

-- TABLA: PRODUCT_IMAGES
CREATE TABLE "product_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"image_url" text NOT NULL,
	"alt_text" text,
	"order" integer DEFAULT 0,
	"is_primary" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);

ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" 
FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
```

### 3. Ejecuta el SQL

- Pega el SQL en el editor
- Click en **Execute** (botón azul arriba)
- Espera confirmación ✅

### 4. Verifica que creó 4 tablas

En Neon, en el panel izquierdo, deberías ver:
- ✅ brands
- ✅ categories  
- ✅ products
- ✅ product_images

---

## 🎯 Una vez hecho esto:

1. Las tablas estarán creadas en Neon
2. Tu app Drizzle podrá leer/escribir en ellas
3. Las queries en `/src/db/queries/` funcionarán automáticamente

---

## 📝 Archivo de migración original:

Si lo necesitas, el SQL autogenerado está en:
`src/db/migrations/0000_famous_angel.sql`
