export type SortDirection = "asc" | "desc";

export interface SortState {
  key: string;
  direction: SortDirection;
}

// Ordena una copia del array según el resolver registrado para sort.key.
// Si no hay sort activo (o la key no tiene resolver), devuelve las filas tal cual.
export function sortRows<T>(
  rows: T[],
  sort: SortState | null,
  resolvers: Record<string, (row: T) => string | number>
): T[] {
  if (!sort) return rows;

  const resolve = resolvers[sort.key];
  if (!resolve) return rows;

  const sorted = [...rows].sort((a, b) => {
    const valueA = resolve(a);
    const valueB = resolve(b);

    if (typeof valueA === "number" && typeof valueB === "number") {
      return valueA - valueB;
    }

    return String(valueA).localeCompare(String(valueB), "es", { sensitivity: "base" });
  });

  return sort.direction === "desc" ? sorted.reverse() : sorted;
}
