import path from "node:path";
import { readExcelRows } from "./excel";
import { importBrands } from "./brands";
import { importCategories } from "./categories";
import { importProducts } from "./products";

function parseArgs(argv: string[]): Record<string, string> {
  const args: Record<string, string> = {};
  for (const arg of argv) {
    const match = arg.match(/^--([^=]+)=(.*)$/);
    if (match) args[match[1]] = match[2];
  }
  return args;
}

export async function runImport(argv: string[]) {
  const args = parseArgs(argv);
  const { type, file, sheet } = args;

  if (!type || !file) {
    console.error(
      'Uso: npm run import -- --type=brands|categories|products --file=ruta/al/archivo.xlsx [--sheet="Nombre de la hoja"]'
    );
    process.exit(1);
  }

  const filePath = path.resolve(process.cwd(), file);
  const rows = readExcelRows(filePath, sheet);
  console.log(`Leyendo ${rows.length} fila(s) de "${file}"...\n`);

  let result;
  switch (type) {
    case "brands":
      result = await importBrands(rows);
      break;
    case "categories":
      result = await importCategories(rows);
      break;
    case "products":
      result = await importProducts(rows);
      break;
    default:
      console.error(`Tipo desconocido: "${type}". Usa brands, categories o products.`);
      process.exit(1);
      return;
  }

  console.log(`✅ Creados: ${result.created}`);
  if (result.skipped.length > 0) {
    console.log(`⚠️  Omitidos: ${result.skipped.length}`);
    for (const item of result.skipped) {
      console.log(`   Fila ${item.row}: ${item.reason}`);
    }
  }

  process.exit(0);
}
