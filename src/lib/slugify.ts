// Convierte texto libre en un slug válido para URLs: minúsculas, números y
// guiones como separador de palabras. Cualquier otro carácter (acentos,
// símbolos, espacios extra) se elimina.
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita acentos/diacríticos (e.g. e-acute -> e)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // cualquier carácter no permitido -> separador
    .replace(/^-+|-+$/g, ""); // sin guiones al inicio/final
}

// Se queda solo con las primeras `wordCount` palabras de un slug ya generado.
// Usado para products, donde el nombre puede ser muy largo para una URL.
export function truncateSlugWords(slug: string, wordCount: number): string {
  return slug
    .split("-")
    .filter(Boolean)
    .slice(0, wordCount)
    .join("-");
}

// Sufijo corto y aleatorio (alfanumerico en minusculas) para garantizar que
// el slug sea unico aunque el nombre se haya truncado.
export function randomSlugSuffix(length = 6): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, length);
  }
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}
