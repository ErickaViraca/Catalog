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
