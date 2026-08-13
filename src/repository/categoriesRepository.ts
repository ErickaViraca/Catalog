import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { categories, NewCategory } from "../db/schema";

export class CategoryRepository {
  async findAll(includeInactive = false) {
    if (includeInactive) {
      return db.select().from(categories);
    }
    return db.select().from(categories).where(eq(categories.active, true));
  }

  async findById(id: string) {
    return db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);
  }

  async findBySlug(slug: string) {
    return db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);
  }

  async create(data: NewCategory) {
    return db.insert(categories).values(data).returning();
  }

  async update(id: string, data: Partial<NewCategory>) {
    return db
      .update(categories)
      .set(data)
      .where(eq(categories.id, id))
      .returning();
  }

  async delete(id: string) {
    return db.delete(categories).where(eq(categories.id, id)).returning();
  }

  async toggleActive(id: string, active: boolean) {
    return db
      .update(categories)
      .set({ active })
      .where(eq(categories.id, id))
      .returning();
  }
}

export const categoryRepository = new CategoryRepository();
