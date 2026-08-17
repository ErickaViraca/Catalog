import { slugify, truncateSlugWords, randomSlugSuffix } from "../../src/lib/slugify";
import { productService } from "../../src/services/productsService";
import { productRepository } from "../../src/repository/productsRepository";
import { brandRepository } from "../../src/repository/brandsRepository";
import { categoryRepository } from "../../src/repository/categoriesRepository";
import { pickField } from "./excel";
import type { ImportResult } from "./brands";

// Columnas booleanas del Excel: 1 = true, 0 = false. Celda vacía -> undefined
// (el service aplica su propio default: active/is_new true, featured false).
function parseBooleanFlag(raw: string): boolean | undefined {
  const trimmed = raw.trim();
  if (trimmed === "") return undefined;
  return trimmed === "1";
}

// Igual que en el admin: primeras 2 palabras del nombre + sufijo aleatorio,
// reintentando el sufijo si por mala suerte colisiona con uno existente.
async function uniqueProductSlug(
  name: string,
  isTaken: (slug: string) => Promise<boolean>
): Promise<string> {
  const base = truncateSlugWords(slugify(name), 2);
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = `${base}-${randomSlugSuffix()}`;
    if (!(await isTaken(candidate))) return candidate;
  }
  throw new Error("No se pudo generar un slug único para el producto");
}

export async function importProducts(rows: Record<string, string>[]): Promise<ImportResult> {
  const result: ImportResult = { created: 0, skipped: [] };
  const seenSlugs = new Set<string>();

  const [allBrands, allCategories] = await Promise.all([
    brandRepository.findAll(),
    categoryRepository.findAll(),
  ]);
  const brandsByName = new Map(allBrands.map((b) => [b.name.toLowerCase(), b.id]));
  const categoriesByName = new Map(allCategories.map((c) => [c.name.toLowerCase(), c.id]));

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 2;

    const name = pickField(row, ["nombre", "name", "producto"]);
    const code = pickField(row, ["codigo_fabricante", "codigo", "code"]);
    const sku = pickField(row, ["codigo_inventario", "sku"]);
    const description = pickField(row, ["descripcion", "description"]);
    const price = pickField(row, ["precio", "price"]);
    const priceBsRaw = pickField(row, ["precio_bs", "preciobs", "price_bs", "pricebs"]);
    const stockRaw = pickField(row, ["stock", "cantidad"]);
    const brandName = pickField(row, ["marca", "brand"]);
    const categoryName = pickField(row, ["categoria", "category"]);
    const featuredRaw = pickField(row, ["destacado", "featured"]);
    const isNewRaw = pickField(row, ["nuevo", "es_nuevo", "is_new", "isnew"]);
    const activeRaw = pickField(row, ["activo", "active"]);

    if (!name) {
      result.skipped.push({ row: rowNumber, reason: "Falta el nombre" });
      continue;
    }

    const brandId = brandsByName.get(brandName.toLowerCase());
    if (!brandId) {
      result.skipped.push({ row: rowNumber, reason: `No se encontró la marca "${brandName}"` });
      continue;
    }

    const categoryId = categoriesByName.get(categoryName.toLowerCase());
    if (!categoryId) {
      result.skipped.push({
        row: rowNumber,
        reason: `No se encontró la categoría "${categoryName}"`,
      });
      continue;
    }

    try {
      const slug = await uniqueProductSlug(name, async (candidate) => {
        if (seenSlugs.has(candidate)) return true;
        const existing = await productRepository.findBySlug(candidate);
        return existing.length > 0;
      });
      seenSlugs.add(slug);

      await productService.createProduct({
        name,
        code: code || undefined,
        slug,
        description,
        price,
        priceBs: priceBsRaw || undefined,
        stock: stockRaw ? Number(stockRaw) : 0,
        sku,
        categoryId,
        brandId,
        active: parseBooleanFlag(activeRaw),
        featured: parseBooleanFlag(featuredRaw),
        isNew: parseBooleanFlag(isNewRaw),
      });
      result.created++;
    } catch (error) {
      result.skipped.push({
        row: rowNumber,
        reason: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  return result;
}
