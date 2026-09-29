import { asc, eq, inArray } from "drizzle-orm";
import { db } from "../db/client";
import { productImages, NewProductImage } from "../db/schema";

export class ProductImageRepository {
  async findByProductId(productId: string) {
    return db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, productId))
      .orderBy(asc(productImages.order));
  }

  // Todas las imágenes de varios productos, ya ordenadas por order.
  async findByProductIds(productIds: string[]) {
    if (productIds.length === 0) return [];

    return db
      .select()
      .from(productImages)
      .where(inArray(productImages.productId, productIds))
      .orderBy(asc(productImages.order));
  }

  async create(data: NewProductImage) {
    return db.insert(productImages).values(data).returning();
  }

  async createMany(data: NewProductImage[]) {
    if (data.length === 0) return [];
    return db.insert(productImages).values(data).returning();
  }

  async deleteByProductId(productId: string) {
    return db
      .delete(productImages)
      .where(eq(productImages.productId, productId))
      .returning();
  }
}

export const productImageRepository = new ProductImageRepository();
