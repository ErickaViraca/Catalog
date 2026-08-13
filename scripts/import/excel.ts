import * as XLSX from "xlsx";

function normalizeHeader(header: string): string {
  return header
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

export function readExcelRows(
  filePath: string,
  sheetName?: string
): Record<string, string>[] {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[sheetName ?? workbook.SheetNames[0]];

  if (!sheet) {
    throw new Error(`No se encontró la hoja "${sheetName}" en el archivo`);
  }

  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  return rawRows.map((row) => {
    const normalized: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
      normalized[normalizeHeader(key)] = String(value ?? "").trim();
    }
    return normalized;
  });
}

// Busca el primer encabezado que exista en la fila, probando varios nombres
// posibles (español/inglés) para no obligar a la planilla a usar un formato exacto.
export function pickField(row: Record<string, string>, candidates: string[]): string {
  for (const candidate of candidates) {
    const key = normalizeHeader(candidate);
    if (row[key]) return row[key];
  }
  return "";
}
