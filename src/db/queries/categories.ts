import { db } from "../client";
import { categories, NewCategory } from "../schema";
import { eq, isNull } from "drizzle-orm";

// GET
export const getAllCategories = async () => {
  return db
    .select()
    .from(categories)
    .where(eq(categories.active, true));
};

export const getCategoryById = async (id: string) => {
  return db.select().from(categories).where(eq(categories.id, id)).limit(1);
};

export const getCategoryBySlug = async (slug: string) => {
  return db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
};

// Get root categories (sin parent)
export const getRootCategories = async () => {
  return db
    .select()
    .from(categories)
    .where(isNull(categories.parentCategoryId));
};

// Get subcategories
export const getSubcategories = async (parentId: string) => {
  return db
    .select()
    .from(categories)
    .where(eq(categories.parentCategoryId, parentId));
};

// CREATE
export const createCategory = async (data: NewCategory) => {
  return db.insert(categories).values(data).returning();
};

// UPDATE
export const updateCategory = async (
  id: string,
  data: Partial<NewCategory>
) => {
  return db
    .update(categories)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(categories.id, id))
    .returning();
};

// DELETE
export const deleteCategory = async (id: string) => {
  return db.delete(categories).where(eq(categories.id, id));
};
