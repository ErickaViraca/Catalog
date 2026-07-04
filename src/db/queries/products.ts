import { db } from "../client";
import { products, NewProduct, productImages } from "../schema";
import { eq, and } from "drizzle-orm";

// GET
export const getAllProducts = async () => {
  return db.select().from(products).where(eq(products.active, true));
};

export const getProductById = async (id: string) => {
  return db.select().from(products).where(eq(products.id, id)).limit(1);
};

export const getProductBySlug = async (slug: string) => {
  return db.select().from(products).where(eq(products.slug, slug)).limit(1);
};

export const getProductBySku = async (sku: string) => {
  return db.select().from(products).where(eq(products.sku, sku)).limit(1);
};

// Get products by category
export const getProductsByCategory = async (categoryId: string) => {
  return db
    .select()
    .from(products)
    .where(
      and(eq(products.categoryId, categoryId), eq(products.active, true))
    );
};

// Get products by brand
export const getProductsByBrand = async (brandId: string) => {
  return db
    .select()
    .from(products)
    .where(and(eq(products.brandId, brandId), eq(products.active, true)));
};

// Get featured products (para home page)
export const getFeaturedProducts = async () => {
  return db
    .select()
    .from(products)
    .where(and(eq(products.featured, true), eq(products.active, true)));
};

// CREATE
export const createProduct = async (data: NewProduct) => {
  return db.insert(products).values(data).returning();
};

// UPDATE
export const updateProduct = async (id: string, data: Partial<NewProduct>) => {
  return db
    .update(products)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning();
};

// DELETE
export const deleteProduct = async (id: string) => {
  return db.delete(products).where(eq(products.id, id));
};

// Get product with images
export const getProductWithImages = async (productId: string) => {
  const product = await getProductById(productId);
  if (!product[0]) return null;

  const images = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .orderBy(productImages.order);

  return {
    ...product[0],
    images,
  };
};
