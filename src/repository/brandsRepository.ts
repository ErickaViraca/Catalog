import { and, eq, ilike } from "drizzle-orm";
import { db } from "../db/client";
import { brands, NewBrand } from "../db/schema";

export class BrandRepository {
  async findAll(includeInactive = false) {
    if (includeInactive) {
      return db.select().from(brands).where(eq(brands.isDeleted, false));
    }
    return db
      .select()
      .from(brands)
      .where(and(eq(brands.active, true), eq(brands.isDeleted, false)));
  }

  // Usado por el buscador del catálogo: "buscar por producto o marca"
  // también matchea productos cuya marca coincide con el término.
  async findByNameSearch(term: string) {
    return db
      .select({ id: brands.id })
      .from(brands)
      .where(and(ilike(brands.name, `%${term}%`), eq(brands.isDeleted, false)));
  }

  async findById(id: string) {
    return db
      .select()
      .from(brands)
      .where(and(eq(brands.id, id), eq(brands.isDeleted, false)))
      .limit(1);
  }

  async findBySlug(slug: string) {
    return db
      .select()
      .from(brands)
      .where(and(eq(brands.slug, slug), eq(brands.isDeleted, false)))
      .limit(1);
  }

  async create(data: NewBrand) {
    return db.insert(brands).values(data).returning();
  }

  async update(id: string, data: Partial<NewBrand>) {
    return db
      .update(brands)
      .set(data)
      .where(eq(brands.id, id))
      .returning();
  }

  // Soft delete: nunca se borra la fila, solo se marca is_deleted = true.
  async delete(id: string) {
    return db
      .update(brands)
      .set({ isDeleted: true })
      .where(eq(brands.id, id))
      .returning();
  }

  async toggleActive(id: string, active: boolean) {
    return db
      .update(brands)
      .set({ active })
      .where(eq(brands.id, id))
      .returning();
  }
}

export const brandRepository = new BrandRepository();
