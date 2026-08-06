import { and, eq, inArray } from "drizzle-orm";
import { db } from "../db/client";
import { productImages, NewProductImage } from "../db/schema";

export class ProductImageRepository {
  async findByProductId(productId: string) {
    return db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, productId));
  }

  async findPrimaryByProductIds(productIds: string[]) {
    if (productIds.length === 0) return [];

    return db
      .select()
      .from(productImages)
      .where(
        and(
          inArray(productImages.productId, productIds),
          eq(productImages.isPrimary, true)
        )
      );
  }

  async create(data: NewProductImage) {
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
