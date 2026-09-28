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

  // "La" imagen de cada producto es la de menor order — se resuelve en
  // memoria (no con una sola query agrupada) para no depender de sintaxis
  // específica de Postgres como DISTINCT ON.
  async findPrimaryByProductIds(productIds: string[]) {
    const rows = await this.findByProductIds(productIds);

    const seen = new Set<string>();
    const primary: typeof rows = [];
    for (const row of rows) {
      if (!seen.has(row.productId)) {
        seen.add(row.productId);
        primary.push(row);
      }
    }
    return primary;
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
