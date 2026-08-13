import { slugify } from "../../src/lib/slugify";
import { brandService } from "../../src/services/brandsService";
import { brandRepository } from "../../src/repository/brandsRepository";
import { pickField } from "./excel";
import { uniqueSlug } from "./slugDedupe";

export interface ImportResult {
  created: number;
  skipped: { row: number; reason: string }[];
}

export async function importBrands(rows: Record<string, string>[]): Promise<ImportResult> {
  const result: ImportResult = { created: 0, skipped: [] };
  const seenSlugs = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 2; // fila real en el Excel (1 = encabezado)

    const name = pickField(row, ["nombre", "name", "marca"]);
    const description = pickField(row, ["descripcion", "description"]) || undefined;
    const logo = pickField(row, ["logo", "imagen", "image"]) || undefined;

    if (!name) {
      result.skipped.push({ row: rowNumber, reason: "Falta el nombre" });
      continue;
    }

    try {
      const base = slugify(name);
      const slug = await uniqueSlug(base, async (candidate) => {
        if (seenSlugs.has(candidate)) return true;
        const existing = await brandRepository.findBySlug(candidate);
        return existing.length > 0;
      });
      seenSlugs.add(slug);

      await brandService.createBrand({ name, slug, logo, description });
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
