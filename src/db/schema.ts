import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  decimal,
  uuid,
  uniqueIndex,
  index,
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
    // Un foreignKey() no crea índice — sin esto, filtrar por categoría o
    // marca (findByCategoryId, findByBrandId, findFiltered en /shop) hace
    // un sequential scan de toda la tabla en cada request.
    categoryIdIdx: index("products_category_id_idx").on(table.categoryId),
    brandIdIdx: index("products_brand_id_idx").on(table.brandId),
    // active/is_deleted están en el WHERE de prácticamente todas las
    // queries de productos (findAll, findById, findFiltered, etc.).
    activeIdx: index("products_active_idx").on(table.active),
    isDeletedIdx: index("products_is_deleted_idx").on(table.isDeleted),
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
    // El más importante de los cuatro: findPrimaryByProductIds filtra por
    // esta columna en cada carga de /products/[slug], en cada listado del
    // catálogo y en el admin — sin índice, es sequential scan completo de
    // product_images en cada una de esas requests.
    productIdIdx: index("product_images_product_id_idx").on(table.productId),
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

// TRACKED LINKS TABLE
// Enlaces cortos (/r/[slug]) que redirigen a una URL destino, usados para
// compartir en redes sociales y medir de dónde viene el interés antes de
// lanzar un proyecto nuevo (ver linkClicks para el detalle de cada visita).
export const trackedLinks = pgTable(
  "tracked_links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique(),
    destinationUrl: text("destination_url").notNull(),
    label: text("label").notNull(), // nombre interno, ej: "Encuesta IG - lanzamiento app"
    active: boolean("active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex("tracked_links_slug_idx").on(table.slug),
  })
);

// LINK CLICKS TABLE
// Una fila por visita a un tracked link. Geolocalización derivada de la IP
// (aproximada a nivel ciudad, no exacta) — no se identifica a la persona ni
// su cuenta de Google, solo de dónde y cuándo llegó el clic.
export const linkClicks = pgTable(
  "link_clicks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    linkId: uuid("link_id").notNull(),
    clickedAt: timestamp("clicked_at").defaultNow(),
    ipAddress: text("ip_address"),
    city: text("city"),
    region: text("region"),
    country: text("country"),
    countryCode: text("country_code"),
    latitude: decimal("latitude", { precision: 9, scale: 6 }),
    longitude: decimal("longitude", { precision: 9, scale: 6 }),
    userAgent: text("user_agent"),
    browser: text("browser"),
    os: text("os"),
    deviceType: text("device_type"),
    referrer: text("referrer"),
  },
  (table) => ({
    // Cada vista del admin agrupa/filtra clicks por link — sin esto,
    // sequential scan completo de link_clicks en cada carga.
    linkIdIdx: index("link_clicks_link_id_idx").on(table.linkId),
    clickedAtIdx: index("link_clicks_clicked_at_idx").on(table.clickedAt),
    // Cascade: borrar un tracked link borra también su historial de clics
    // (ver confirmación de borrado en el admin).
    linkFk: foreignKey({
      columns: [table.linkId],
      foreignColumns: [trackedLinks.id],
    }).onDelete("cascade"),
  })
);

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

export type TrackedLink = typeof trackedLinks.$inferSelect;
export type NewTrackedLink = typeof trackedLinks.$inferInsert;

export type LinkClick = typeof linkClicks.$inferSelect;
export type NewLinkClick = typeof linkClicks.$inferInsert;
