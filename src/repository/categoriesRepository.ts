import { and, eq } from "drizzle-orm";
import { db } from "../db/client";
import { categories, NewCategory } from "../db/schema";

export class CategoryRepository {
  async findAll(includeInactive = false) {
    if (includeInactive) {
      return db.select().from(categories).where(eq(categories.isDeleted, false));
    }
    return db
      .select()
      .from(categories)
      .where(and(eq(categories.active, true), eq(categories.isDeleted, false)));
  }

  async findById(id: string) {
    return db
      .select()
      .from(categories)
      .where(and(eq(categories.id, id), eq(categories.isDeleted, false)))
      .limit(1);
  }

  async findBySlug(slug: string) {
    return db
      .select()
      .from(categories)
      .where(and(eq(categories.slug, slug), eq(categories.isDeleted, false)))
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

  // Soft delete: nunca se borra la fila, solo se marca is_deleted = true.
  async delete(id: string) {
    return db
      .update(categories)
      .set({ isDeleted: true })
      .where(eq(categories.id, id))
      .returning();
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
