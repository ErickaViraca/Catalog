"use client";

import { useState, useEffect, useRef } from "react";
import { ProductCard } from "@/components/products/ProductCard";
import { Pagination } from "@/components/products/Pagination";
import { Button } from "@/components/common/Button";
import { normalizeApiProduct } from "@/src/lib/normalizeProduct";

const PAGE_SIZE = 12;

export default function ShopPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();
        if (data.success) {
          setCategories(data.data);
        }
      } catch (err) {
        console.error("Error al obtener las categorías", err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        const params = new URLSearchParams();
        if (selectedCategory) params.set("categoryIds", selectedCategory);
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
  }, [selectedCategory, searchTerm, sortBy, page]);

  const goToPage = (newPage: number) => {
    setPage(newPage);
    productsTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const rangeStart = totalProducts === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, totalProducts);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Catálogo</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6">
        {/* Sidebar */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          {/* Search */}
          <div className="mb-6">
            <h3 className="font-semibold text-sm mb-2">Buscar</h3>
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Categories Filter */}
          <div className="mb-6">
            <h3 className="font-semibold text-sm mb-2">Categorías</h3>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setPage(1);
                }}
                className={`block w-full text-left px-2 py-1.5 text-sm rounded-lg transition-colors ${
                  selectedCategory === null
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-200"
                }`}
              >
                Todas
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setPage(1);
                  }}
                  className={`block w-full text-left px-2 py-1.5 text-sm rounded-lg transition-colors ${
                    selectedCategory === cat.id
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-200"
                  }`}
                >
                  {cat.name}
                </button>
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
                  setSelectedCategory(null);
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
