import { db } from "../client";
import { productImages, NewProductImage } from "../schema";
import { eq } from "drizzle-orm";

// GET
export const getProductImages = async (productId: string) => {
  return db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .orderBy(productImages.order);
};

export const getPrimaryImage = async (productId: string) => {
  return db
    .select()
    .from(productImages)
    .where(eq(productImages.isPrimary, true))
    .limit(1);
};

export const getImageById = async (id: string) => {
  return db.select().from(productImages).where(eq(productImages.id, id)).limit(1);
};

// CREATE
export const createProductImage = async (data: NewProductImage) => {
  return db.insert(productImages).values(data).returning();
};

// Agregar múltiples imágenes a un producto
export const createProductImages = async (images: NewProductImage[]) => {
  return db.insert(productImages).values(images).returning();
};

// UPDATE
export const updateProductImage = async (
  id: string,
  data: Partial<NewProductImage>
) => {
  return db
    .update(productImages)
    .set(data)
    .where(eq(productImages.id, id))
    .returning();
};

// Set primary image (desactivar otras)
export const setPrimaryImage = async (imageId: string, productId: string) => {
  // Remover otros primarios
  await db
    .update(productImages)
    .set({ isPrimary: false })
    .where(eq(productImages.productId, productId));

  // Setear este como primario
  return db
    .update(productImages)
    .set({ isPrimary: true })
    .where(eq(productImages.id, imageId))
    .returning();
};

// DELETE
export const deleteProductImage = async (id: string) => {
  return db.delete(productImages).where(eq(productImages.id, id));
};

// DELETE todas las imágenes de un producto
export const deleteProductImages = async (productId: string) => {
  return db
    .delete(productImages)
    .where(eq(productImages.productId, productId));
};
