// Formato de precio para el catálogo público: siempre en bolivianos
// (price_bs), no en dólares — un solo lugar para no repetir el prefijo
// "Bs.-" en cada componente que muestra un precio.
export function formatBs(value: string | number): string {
  const amount = Number(value) || 0;
  return `Bs.- ${amount.toFixed(2)}`;
}
