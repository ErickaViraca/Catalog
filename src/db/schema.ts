import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  decimal,
  uuid,
  uniqueIndex,
  foreignKey,
  jsonb,
} from "drizzle-orm/pg-core";

// BRANDS TABLE
export const brands = pgTable(
  "brands",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull().unique(),
    slug: text("slug").notNull().unique(),
    logo: text("logo"), // S3 URL
    description: text("description"),
    active: boolean("active").default(true),
    isDeleted: boolean("is_deleted").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex("brands_slug_idx").on(table.slug),
  })
);

// CATEGORIES TABLE
export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull().unique(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    image: text("image"), // S3 URL
    parentCategoryId: uuid("parent_category_id"), // Para subcategorías
    active: boolean("active").default(true),
    isDeleted: boolean("is_deleted").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex("categories_slug_idx").on(table.slug),
    parentFk: foreignKey({
      columns: [table.parentCategoryId],
      foreignColumns: [table.id],
    }),
  })
);

// PRODUCTS TABLE
export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    code: text("code"), // Código de fabricante — opcional
    slug: text("slug").notNull().unique(),
    description: text("description").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    // price * companies.dollar_price_bs — se recalcula en el service al
    // crear/editar el producto, pero es editable a mano desde el form.
    priceBs: decimal("price_bs", { precision: 10, scale: 2 }).notNull().default("0"),
    stock: integer("stock").notNull().default(0),
    sku: text("sku").notNull().unique(), // Código único
    categoryId: uuid("category_id").notNull(),
    brandId: uuid("brand_id").notNull(),
    active: boolean("active").default(true),
    featured: boolean("featured").default(false),
    isNew: boolean("is_new").default(true),
    isDeleted: boolean("is_deleted").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex("products_slug_idx").on(table.slug),
    skuIdx: uniqueIndex("products_sku_idx").on(table.sku),
    categoryFk: foreignKey({
      columns: [table.categoryId],
      foreignColumns: [categories.id],
    }),
    brandFk: foreignKey({
      columns: [table.brandId],
      foreignColumns: [brands.id],
    }),
  })
);

// PRODUCT IMAGES TABLE
export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id").notNull(),
    imageUrl: text("image_url").notNull(), // S3 URL
    altText: text("alt_text"), // SEO
    order: integer("order").default(0), // Para ordenar galería
    isPrimary: boolean("is_primary").default(false), // Imagen principal
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    productFk: foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
    }),
  })
);

// COMPANIES TABLE
// Fila única con los datos editables desde /adminMiTiendaSmart26 (sección Configuración):
// nombre, cotización del dólar en bolivianos, teléfonos y direcciones.
// phones/addresses son listas cortas mantenidas a mano por el admin, no
// datos relacionales, así que van como jsonb en vez de tablas aparte.
export interface CompanyAddress {
  address: string;
  // Link de Google Maps ingresado manualmente por el admin (no se genera
  // automáticamente) — ver Configuración > Direcciones.
  mapsUrl: string;
}

export const companies = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  dollarPriceBs: decimal("dollar_price_bs", { precision: 10, scale: 2 }).notNull(),
  phones: jsonb("phones").$type<string[]>().notNull().default([]),
  addresses: jsonb("addresses").$type<CompanyAddress[]>().notNull().default([]),
  facebookUrl: text("facebook_url").notNull().default(""),
  whatsappUrl: text("whatsapp_url").notNull().default(""),
  instagramUrl: text("instagram_url").notNull().default(""),
  // URL en R2 (carpeta "banners") de la imagen de fondo del hero de Inicio.
  heroBannerUrl: text("hero_banner_url").notNull().default(""),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// EXPORT TYPES
export type Brand = typeof brands.$inferSelect;
export type NewBrand = typeof brands.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type ProductImage = typeof productImages.$inferSelect;
export type NewProductImage = typeof productImages.$inferInsert;

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
