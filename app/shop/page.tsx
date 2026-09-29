"use client";

import { useState, useEffect, useRef } from "react";
import { ProductCard } from "@/components/products/ProductCard";
import { Pagination } from "@/components/products/Pagination";
import { Button } from "@/components/common/Button";
import { ShopFilters } from "@/components/products/ShopFilters";
// Import directo del componente: desde la raíz del paquete el navegador
// descarga todos los componentes de Material Tailwind (no se recortan).
import { Drawer } from "@material-tailwind/react/dist/components/drawer";
import { Product, Category, Brand } from "@/types";

export default function ShopPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc">(
    "name"
  );
  const [page, setPage] = useState(1);

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const productsTopRef = useRef<HTMLDivElement>(null);

  // Panel de filtros del celular (en desktop los filtros van en la barra lateral)
  const [filtersOpen, setFiltersOpen] = useState(false);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setFiltersOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  // Filtros del sidebar: se cargan una sola vez (solo categorías/marcas activas)
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.data);
      })
      .catch((err) => console.error("Error al obtener categorías", err));

    fetch("/api/brands")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setBrands(data.data);
      })
      .catch((err) => console.error("Error al obtener marcas", err));
  }, []);

  // Debounce de la búsqueda: espera a que el usuario deje de escribir
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Productos: un fetch a /api/products por cada combinación de filtros/orden/página
  useEffect(() => {
    let cancelled = false;
    setProductsLoading(true);

    const params = new URLSearchParams();
    if (selectedCategoryIds.length) params.set("categoryIds", selectedCategoryIds.join(","));
    if (selectedBrandIds.length) params.set("brandIds", selectedBrandIds.join(","));
    if (searchTerm) params.set("search", searchTerm);
    params.set("sort", sortBy);
    params.set("page", String(page));

    fetch(`/api/products?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success) {
          setProducts(data.data);
          setTotalProducts(data.count);
          setTotalPages(data.totalPages);
        }
      })
      .catch((err) => console.error("Error al obtener productos", err))
      .finally(() => {
        if (!cancelled) setProductsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCategoryIds, selectedBrandIds, searchTerm, sortBy, page]);

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

  const clearFilters = () => {
    setSelectedCategoryIds([]);
    setSelectedBrandIds([]);
    setPage(1);
  };

  const activeFilterCount = selectedCategoryIds.length + selectedBrandIds.length;

  const sortSelect = (id: string) => (
    <select
      id={id}
      value={sortBy}
      onChange={(e) => {
        setSortBy(e.target.value as "name" | "price-asc" | "price-desc");
        setPage(1);
      }}
      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="name">Nombre (A-Z)</option>
      <option value="price-asc">Precio (Menor a Mayor)</option>
      <option value="price-desc">Precio (Mayor a Menor)</option>
    </select>
  );

  const goToPage = (newPage: number) => {
    setPage(newPage);
    productsTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const PAGE_SIZE = 12;
  const rangeStart = totalProducts === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, totalProducts);

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Catálogo</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        {/* Sidebar (solo desktop): en el celular estos filtros van en el panel */}
        <div className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
          <ShopFilters
            idPrefix="side"
            categories={categories}
            brands={brands}
            selectedCategoryIds={selectedCategoryIds}
            selectedBrandIds={selectedBrandIds}
            onToggleCategory={toggleCategory}
            onToggleBrand={toggleBrand}
            onClear={clearFilters}
          />

          {/* Sort */}
          <div className="mb-6">
            <label htmlFor="sort-side" className="block font-semibold text-sm mb-2">
              Ordenar por
            </label>
            {sortSelect("sort-side")}
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

          {/* Barra del celular: botón que abre el panel de filtros + orden */}
          <div className="lg:hidden mb-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              aria-haspopup="dialog"
              className="inline-flex items-center gap-2 shrink-0 rounded-full border border-gray-400 bg-white px-5 py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
                <circle cx="16" cy="7" r="2" />
                <circle cx="8" cy="17" r="2" />
              </svg>
              Filtros
              {activeFilterCount > 0 && (
                <span
                  data-filter-count
                  className="min-w-5 h-5 px-1 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center"
                >
                  {activeFilterCount}
                </span>
              )}
            </button>
            <div className="flex-1">
              <label htmlFor="sort-mobile" className="sr-only">
                Ordenar por
              </label>
              {sortSelect("sort-mobile")}
            </div>
          </div>

          {productsLoading ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">Cargando productos...</p>
            </div>
          ) : products.length === 0 ? (
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} hideAddToCart tall swipeImages />
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

      {/* Panel de filtros del celular. Los estilos van todos por className:
          Tailwind no escanea node_modules, así que las clases internas del
          Drawer no se generan y la posición/tamaño las damos nosotros. */}
      <Drawer open={filtersOpen} onOpenChange={setFiltersOpen}>
        <Drawer.Overlay className="z-[99] bg-black/40 drawer-overlay-enter">
          <Drawer.Panel
            placement="left"
            aria-label="Filtros"
            className="fixed inset-y-0 left-0 z-[100] w-[85%] max-w-sm h-full p-0 bg-white border-0 shadow-2xl flex flex-col drawer-panel-enter"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-lg font-bold">Filtros</h2>
              <Drawer.DismissTrigger
                aria-label="Cerrar filtros"
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </Drawer.DismissTrigger>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <ShopFilters
                idPrefix="drawer"
                categories={categories}
                brands={brands}
                selectedCategoryIds={selectedCategoryIds}
                selectedBrandIds={selectedBrandIds}
                onToggleCategory={toggleCategory}
                onToggleBrand={toggleBrand}
                onClear={clearFilters}
              />
            </div>

            <div className="flex gap-3 px-5 py-4 border-t border-border">
              <Button
                variant="secondary"
                className="shrink-0"
                onClick={clearFilters}
                disabled={activeFilterCount === 0}
              >
                Limpiar
              </Button>
              <Button className="flex-1 whitespace-nowrap" onClick={() => setFiltersOpen(false)}>
                Ver {totalProducts} {totalProducts === 1 ? "producto" : "productos"}
              </Button>
            </div>
          </Drawer.Panel>
        </Drawer.Overlay>
      </Drawer>
    </div>
  );
}
