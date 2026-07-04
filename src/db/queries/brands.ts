import { db } from "../client";
import { brands, NewBrand } from "../schema";
import { eq } from "drizzle-orm";

// GET
export const getAllBrands = async () => {
  return db.select().from(brands).where(eq(brands.active, true));
};

export const getBrandById = async (id: string) => {
  return db.select().from(brands).where(eq(brands.id, id)).limit(1);
};

export const getBrandBySlug = async (slug: string) => {
  return db.select().from(brands).where(eq(brands.slug, slug)).limit(1);
};

// CREATE
export const createBrand = async (data: NewBrand) => {
  return db.insert(brands).values(data).returning();
};

// UPDATE
export const updateBrand = async (id: string, data: Partial<NewBrand>) => {
  return db
    .update(brands)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(brands.id, id))
    .returning();
};

// DELETE
export const deleteBrand = async (id: string) => {
  return db.delete(brands).where(eq(brands.id, id));
};
