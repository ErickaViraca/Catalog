"use client";

import { useState, useEffect, useRef } from "react";
import { ProductCard } from "@/components/products/ProductCard";
import { Pagination } from "@/components/products/Pagination";
import { Button } from "@/components/common/Button";
import { Checkbox } from "@/components/form";
import { normalizeApiProduct } from "@/src/lib/normalizeProduct";

const PAGE_SIZE = 12;

export default function ShopPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc">(
    "name"
  );
  const [page, setPage] = useState(1);

  const [products, setProducts] = useState<any[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [productsLoading, setProductsLoading] = useState(false);

  const productsTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/brands"),
        ]);
        const categoriesData = await categoriesRes.json();
        const brandsData = await brandsRes.json();
        if (categoriesData.success) setCategories(categoriesData.data);
        if (brandsData.success) setBrands(brandsData.data);
      } catch (err) {
        console.error("Error al obtener los filtros", err);
      }
    };

    fetchFilters();
  }, []);

  // Debounce de la búsqueda: espera a que el usuario deje de escribir
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        const params = new URLSearchParams();
        if (selectedCategoryIds.length) {
          params.set("categoryIds", selectedCategoryIds.join(","));
        }
        if (selectedBrandIds.length) {
          params.set("brandIds", selectedBrandIds.join(","));
        }
        if (searchTerm) params.set("search", searchTerm);
        params.set("sort", sortBy);
        params.set("page", String(page));

        const response = await fetch(`/api/products?${params.toString()}`);
        const data = await response.json();
        if (data.success) {
          setProducts(data.data);
          setTotalProducts(data.count ?? data.data.length);
          setTotalPages(data.totalPages ?? 1);
        }
      } catch (err) {
        console.error("Error al obtener los productos", err);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
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
          {/* Categories Filter */}
          <div className="mb-6">
            <h3 className="font-semibold text-sm mb-2">Categorías</h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <Checkbox
                  key={cat.id}
                  label={cat.name}
                  checked={selectedCategoryIds.includes(cat.id)}
                  onChange={() => toggleCategory(cat.id)}
                />
              ))}
            </div>
          </div>

          {/* Brands Filter */}
          <div className="mb-6">
            <h3 className="font-semibold text-sm mb-2">Marcas</h3>
            <div className="space-y-2">
              {brands.map((brand) => (
                <Checkbox
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
          {/* Buscador, arriba de los productos */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Buscar por producto o marca..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full px-4 py-3 text-sm border border-border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-colors"
            />
          </div>

          <div ref={productsTopRef} className="mb-6 flex justify-between items-center">
            <p className="text-gray-600">
              {totalProducts > 0
                ? `Mostrando ${rangeStart}–${rangeEnd} de ${totalProducts} productos`
                : "Mostrando 0 productos"}
            </p>
          </div>

          {productsLoading ? (
            <div className="text-center py-12 text-gray-500">Cargando productos...</div>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={normalizeApiProduct(product)}
                    hideAddToCart
                  />
                ))}
              </div>

              <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
