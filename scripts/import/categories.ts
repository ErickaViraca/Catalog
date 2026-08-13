import { slugify } from "../../src/lib/slugify";
import { categoryService } from "../../src/services/categoriesService";
import { categoryRepository } from "../../src/repository/categoriesRepository";
import { pickField } from "./excel";
import { uniqueSlug } from "./slugDedupe";
import type { ImportResult } from "./brands";

export async function importCategories(rows: Record<string, string>[]): Promise<ImportResult> {
  const result: ImportResult = { created: 0, skipped: [] };
  const seenSlugs = new Set<string>();

  // Mapa nombre -> id para resolver "categoría padre" por nombre, incluyendo
  // las categorías que se van creando durante esta misma corrida.
  const existingCategories = await categoryRepository.findAll();
  const categoryNameToId = new Map(
    existingCategories.map((category) => [category.name.toLowerCase(), category.id])
  );

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 2;

    const name = pickField(row, ["nombre", "name", "categoria"]);
    const description = pickField(row, ["descripcion", "description"]) || undefined;
    const image = pickField(row, ["imagen", "image"]) || undefined;
    const parentName = pickField(row, ["categoria_padre", "padre", "parent"]);

    if (!name) {
      result.skipped.push({ row: rowNumber, reason: "Falta el nombre" });
      continue;
    }

    let parentCategoryId: string | undefined;
    if (parentName) {
      parentCategoryId = categoryNameToId.get(parentName.toLowerCase());
      if (!parentCategoryId) {
        result.skipped.push({
          row: rowNumber,
          reason: `No se encontró la categoría padre "${parentName}"`,
        });
        continue;
      }
    }

    try {
      const base = slugify(name);
      const slug = await uniqueSlug(base, async (candidate) => {
        if (seenSlugs.has(candidate)) return true;
        const existing = await categoryRepository.findBySlug(candidate);
        return existing.length > 0;
      });
      seenSlugs.add(slug);

      const created = await categoryService.createCategory({
        name,
        slug,
        image,
        description,
        parentCategoryId,
      });
      if (created) categoryNameToId.set(created.name.toLowerCase(), created.id);
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
