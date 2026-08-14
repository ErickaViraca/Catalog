import { eq, ilike } from "drizzle-orm";
import { db } from "../db/client";
import { brands, NewBrand } from "../db/schema";

export class BrandRepository {
  async findAll(includeInactive = false) {
    if (includeInactive) {
      return db.select().from(brands);
    }
    return db.select().from(brands).where(eq(brands.active, true));
  }

  // Usado por el buscador del catálogo: "buscar por producto o marca"
  // también matchea productos cuya marca coincide con el término.
  async findByNameSearch(term: string) {
    return db
      .select({ id: brands.id })
      .from(brands)
      .where(ilike(brands.name, `%${term}%`));
  }

  async findById(id: string) {
    return db
      .select()
      .from(brands)
      .where(eq(brands.id, id))
      .limit(1);
  }

  async findBySlug(slug: string) {
    return db
      .select()
      .from(brands)
      .where(eq(brands.slug, slug))
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

  async delete(id: string) {
    return db.delete(brands).where(eq(brands.id, id)).returning();
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
