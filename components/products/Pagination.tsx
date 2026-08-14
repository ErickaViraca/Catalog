"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@/components/common/icons";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Ventana deslizante de páginas visibles alrededor de la página actual,
// para no renderizar decenas de botones cuando hay muchas páginas.
function getPageWindow(current: number, total: number, size = 5): number[] {
  if (total <= size) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  let start = Math.max(1, current - Math.floor(size / 2));
  let end = start + size - 1;

  if (end > total) {
    end = total;
    start = end - size + 1;
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageWindow(page, totalPages);

  const arrowStyles =
    "w-9 h-9 flex items-center justify-center rounded-lg border border-border text-label transition-colors hover:border-primary hover:text-primary disabled:opacity-40 disabled:hover:border-border disabled:hover:text-label";

  return (
    <nav aria-label="Paginación" className="flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Página anterior"
        className={arrowStyles}
      >
        <ChevronLeftIcon size={16} />
      </button>

      {pageNumbers.map((num) => (
        <button
          key={num}
          type="button"
          onClick={() => onPageChange(num)}
          aria-current={num === page ? "page" : undefined}
          className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
            num === page
              ? "bg-primary text-white"
              : "border border-border text-label hover:border-primary hover:text-primary"
          }`}
        >
          {num}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Página siguiente"
        className={arrowStyles}
      >
        <ChevronRightIcon size={16} />
      </button>
    </nav>
  );
}
