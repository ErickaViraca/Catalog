import { and, asc, desc, eq, ilike, inArray, or, sql, SQL } from "drizzle-orm";
import { db } from "../db/client";
import { products, NewProduct } from "../db/schema";

export interface ProductFilterOptions {
  categoryIds?: string[];
  brandIds?: string[];
  search?: string;
  // Marcas cuyo nombre matchea el término de búsqueda (resueltas en el
  // service) — un producto también entra si pertenece a alguna de estas.
  searchBrandIds?: string[];
  sort?: "name" | "price-asc" | "price-desc";
  page: number;
  limit: number;
}

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

  // Filtro combinado para el catálogo público: categorías/marcas son OR
  // dentro de cada grupo, y AND entre grupos (categoría Y marca Y búsqueda).
  async findFiltered(options: ProductFilterOptions) {
    const conditions: SQL[] = [eq(products.active, true)];

    if (options.categoryIds?.length) {
      conditions.push(inArray(products.categoryId, options.categoryIds));
    }

    if (options.brandIds?.length) {
      conditions.push(inArray(products.brandId, options.brandIds));
    }

    if (options.search) {
      const term = `%${options.search}%`;
      const searchConditions = [ilike(products.name, term)];
      if (options.searchBrandIds?.length) {
        searchConditions.push(inArray(products.brandId, options.searchBrandIds));
      }
      conditions.push(or(...searchConditions)!);
    }

    const whereClause = and(...conditions)!;

    const orderBy =
      options.sort === "price-asc"
        ? asc(products.price)
        : options.sort === "price-desc"
          ? desc(products.price)
          : asc(products.name);

    const offset = (options.page - 1) * options.limit;

    const [rows, totalRows] = await Promise.all([
      db
        .select()
        .from(products)
        .where(whereClause)
        .orderBy(orderBy)
        .limit(options.limit)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(products).where(whereClause),
    ]);

    return { rows, total: Number(totalRows[0]?.count ?? 0) };
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
