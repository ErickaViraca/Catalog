"use client";

import { FilterCheckbox } from "@/components/products/FilterCheckbox";
import { Category, Brand } from "@/types";

interface ShopFiltersProps {
  categories: Category[];
  brands: Brand[];
  selectedCategoryIds: string[];
  selectedBrandIds: string[];
  onToggleCategory: (id: string) => void;
  onToggleBrand: (id: string) => void;
  onClear: () => void;
  // Prefijo para los id de los checkboxes: la misma lista se renderiza en la
  // barra lateral (desktop) y en el panel (celular), y un id repetido hace
  // que el <label> apunte al checkbox equivocado.
  idPrefix: string;
}

// Contenido de los filtros del catálogo (todos / categorías / marcas),
// compartido por la barra lateral y el panel deslizable del celular.
export function ShopFilters({
  categories,
  brands,
  selectedCategoryIds,
  selectedBrandIds,
  onToggleCategory,
  onToggleBrand,
  onClear,
  idPrefix,
}: ShopFiltersProps) {
  return (
    <>
      {/* Todos los productos: atajo para limpiar categorías y marcas de una */}
      <div className="mb-6">
        <FilterCheckbox
          id={`${idPrefix}-all`}
          label="Todos los productos"
          checked={selectedCategoryIds.length === 0 && selectedBrandIds.length === 0}
          onChange={onClear}
        />
      </div>

      {/* Categories Filter: scroll vertical propio, sin borde ni flechas */}
      <div className="mb-6">
        <h3 className="font-semibold text-sm mb-2">Categorías</h3>
        <div className="scrollbar-minimal max-h-48 overflow-y-auto pr-1 space-y-2">
          {categories.map((cat) => (
            <FilterCheckbox
              key={cat.id}
              id={`${idPrefix}-cat-${cat.id}`}
              label={cat.name}
              checked={selectedCategoryIds.includes(cat.id)}
              onChange={() => onToggleCategory(cat.id)}
            />
          ))}
        </div>
      </div>

      {/* Brands Filter: scroll vertical propio, independiente del de Categorías */}
      <div className="mb-6">
        <h3 className="font-semibold text-sm mb-2">Marcas</h3>
        <div className="scrollbar-minimal max-h-48 overflow-y-auto pr-1 space-y-2">
          {brands.map((brand) => (
            <FilterCheckbox
              key={brand.id}
              id={`${idPrefix}-brand-${brand.id}`}
              label={brand.name}
              checked={selectedBrandIds.includes(brand.id)}
              onChange={() => onToggleBrand(brand.id)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
