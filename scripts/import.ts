// Punto de entrada del importador. Carga las variables de entorno ANTES de
// importar cualquier módulo que use la base de datos (src/db/client.ts lee
// DATABASE_URL apenas se importa), por eso el import de "./import/run" es
// dinámico y ocurre después de dotenv.config().
//
// Uso:
//   npm run import -- --type=brands --file=data/marcas.xlsx
//   npm run import -- --type=categories --file=data/categorias.xlsx
//   npm run import -- --type=products --file=data/productos.xlsx [--sheet="Hoja1"]
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const { runImport } = await import("./import/run");
  await runImport(process.argv.slice(2));
}

main().catch((error) => {
  console.error("Error inesperado:", error);
  process.exit(1);
});
