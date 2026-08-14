"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { ProductCard } from "@/components/products/ProductCard";
import { Pagination } from "@/components/products/Pagination";
import { Button } from "@/components/common/Button";
import { FilterCheckbox } from "@/components/products/FilterCheckbox";
import { mockProducts, mockCategories, mockBrands } from "@/data/mock";

// TODO: todavía no hay productos reales cargados en la DB, así que esta
// página sigue usando los mocks (incluye brandId para poder probar el
// filtro de marcas). Cuando haya datos reales, volver a fetch("/api/products")
// con los mismos query params que ya soporta el backend (categoryIds,
// brandIds, search, sort, page) — ver el commit de paginación para esa
// versión.
const PAGE_SIZE = 12;

export default function ShopPage() {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc">(
    "name"
  );
  const [page, setPage] = useState(1);

  const productsTopRef = useRef<HTMLDivElement>(null);

  // Debounce de la búsqueda: espera a que el usuario deje de escribir
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const filteredProducts = useMemo(() => {
    let filtered = mockProducts;

    if (selectedCategoryIds.length) {
      filtered = filtered.filter((p) => selectedCategoryIds.includes(p.categoryId));
    }

    if (selectedBrandIds.length) {
      filtered = filtered.filter((p) => selectedBrandIds.includes(p.brandId));
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((p) => {
        const brandName = mockBrands.find((b) => b.id === p.brandId)?.name.toLowerCase() ?? "";
        return p.name.toLowerCase().includes(term) || brandName.includes(term);
      });
    }

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [selectedCategoryIds, selectedBrandIds, searchTerm, sortBy]);

  const totalProducts = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));
  const products = useMemo(
    () => filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredProducts, page]
  );

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
    setPage(1);
  };

  const toggleBrand = (id: string) => {
    setSelectedBrandIds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
    setPage(1);
  };

  const goToPage = (newPage: number) => {
    setPage(newPage);
    productsTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const rangeStart = totalProducts === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, totalProducts);

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Catálogo</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        {/* Sidebar */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          {/* Todos los productos: atajo para limpiar categorías y marcas de una */}
          <div className="mb-6">
            <FilterCheckbox
              label="Todos los productos"
              checked={selectedCategoryIds.length === 0 && selectedBrandIds.length === 0}
              onChange={() => {
                setSelectedCategoryIds([]);
                setSelectedBrandIds([]);
                setPage(1);
              }}
            />
          </div>

          {/* Categories Filter: caja con scroll vertical propio */}
          <div className="mb-6">
            <h3 className="font-semibold text-sm mb-2">Categorías</h3>
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-2">
              {mockCategories.map((cat) => (
                <FilterCheckbox
                  key={cat.id}
                  label={cat.name}
                  checked={selectedCategoryIds.includes(cat.id)}
                  onChange={() => toggleCategory(cat.id)}
                />
              ))}
            </div>
          </div>

          {/* Brands Filter: caja con su propio scroll vertical, independiente del de Categorías */}
          <div className="mb-6">
            <h3 className="font-semibold text-sm mb-2">Marcas</h3>
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-2">
              {mockBrands.map((brand) => (
                <FilterCheckbox
                  key={brand.id}
                  label={brand.name}
                  checked={selectedBrandIds.includes(brand.id)}
                  onChange={() => toggleBrand(brand.id)}
                />
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="mb-6">
            <h3 className="font-semibold text-sm mb-2">Ordenar por</h3>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as "name" | "price-asc" | "price-desc");
                setPage(1);
              }}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Nombre (A-Z)</option>
              <option value="price-asc">Precio (Menor a Mayor)</option>
              <option value="price-desc">Precio (Mayor a Menor)</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div>
          {/* Buscador (mitad de ancho) + paginación compacta, lados opuestos */}
          <div ref={productsTopRef} className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <input
              type="text"
              placeholder="Buscar por producto o marca..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full sm:w-1/2 px-4 py-3 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
            />
            <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">No se encontraron productos</p>
              <Button
                onClick={() => {
                  setSelectedCategoryIds([]);
                  setSelectedBrandIds([]);
                  setSearchInput("");
                  setSearchTerm("");
                  setPage(1);
                }}
                className="mt-4"
              >
                Restablecer Filtros
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} hideAddToCart />
                ))}
              </div>

              {/* Mismo layout que la fila de arriba: "Mostrando..." alineado
                  con el buscador (mismo ancho/posición), paginación al lado opuesto */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="w-full sm:w-1/2">
                  <p className="text-gray-600">
                    {totalProducts > 0
                      ? `Mostrando ${rangeStart}–${rangeEnd} de ${totalProducts} productos`
                      : "Mostrando 0 productos"}
                  </p>
                </div>
                <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
