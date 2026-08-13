// Prueba el slug base y, si ya está tomado (en la DB o dentro del mismo
// archivo que se está importando), le agrega -2, -3, etc. hasta encontrar
// uno libre. Usado por brands y categories, que no tienen sufijo aleatorio.
export async function uniqueSlug(
  base: string,
  isTaken: (slug: string) => Promise<boolean>
): Promise<string> {
  let candidate = base;
  let attempt = 2;
  while (await isTaken(candidate)) {
    candidate = `${base}-${attempt}`;
    attempt++;
  }
  return candidate;
}
