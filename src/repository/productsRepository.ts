import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { products, NewProduct } from "../db/schema";

export class ProductRepository {
  async findAll() {
    return db.select().from(products).where(eq(products.active, true));
  }

  async findById(id: string) {
    return db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
  }

  async findBySlug(slug: string) {
    return db
      .select()
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);
  }

  async findBySku(sku: string) {
    return db
      .select()
      .from(products)
      .where(eq(products.sku, sku))
      .limit(1);
  }

  async findByCategoryId(categoryId: string) {
    return db
      .select()
      .from(products)
      .where(eq(products.categoryId, categoryId));
  }

  async findByBrandId(brandId: string) {
    return db
      .select()
      .from(products)
      .where(eq(products.brandId, brandId));
  }

  async create(data: NewProduct) {
    return db.insert(products).values(data).returning();
  }

  async update(id: string, data: Partial<NewProduct>) {
    return db
      .update(products)
      .set(data)
      .where(eq(products.id, id))
      .returning();
  }

  async delete(id: string) {
    return db.delete(products).where(eq(products.id, id)).returning();
  }

  async toggleActive(id: string, active: boolean) {
    return db
      .update(products)
      .set({ active })
      .where(eq(products.id, id))
      .returning();
  }

  async toggleFeatured(id: string, featured: boolean) {
    return db
      .update(products)
      .set({ featured })
      .where(eq(products.id, id))
      .returning();
  }
}

export const productRepository = new ProductRepository();
