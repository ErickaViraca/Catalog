import { SortDirection, SortState } from "@/src/lib/sortRows";

interface SortableHeaderProps {
  label: string;
  sortKey: string;
  currentSort: SortState | null;
  onSort: (key: string, direction: SortDirection) => void;
}

export function SortableHeader({ label, sortKey, currentSort, onSort }: SortableHeaderProps) {
  const activeDirection = currentSort?.key === sortKey ? currentSort.direction : null;

  return (
    <th className="px-6 py-3 text-left text-sm font-semibold">
      <div className="flex items-center gap-1.5">
        <span>{label}</span>
        <span className="flex flex-col leading-none">
          <button
            type="button"
            aria-label={`Ordenar ${label} ascendente`}
            onClick={() => onSort(sortKey, "asc")}
            className={`text-[10px] leading-none transition-colors ${
              activeDirection === "asc" ? "text-primary" : "text-muted hover:text-label"
            }`}
          >
            ▲
          </button>
          <button
            type="button"
            aria-label={`Ordenar ${label} descendente`}
            onClick={() => onSort(sortKey, "desc")}
            className={`text-[10px] leading-none transition-colors ${
              activeDirection === "desc" ? "text-primary" : "text-muted hover:text-label"
            }`}
          >
            ▼
          </button>
        </span>
      </div>
    </th>
  );
}
