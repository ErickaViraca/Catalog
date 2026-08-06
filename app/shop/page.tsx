"use client";

import { useState, useEffect, useMemo } from "react";
import { ProductCard } from "@/components/products/ProductCard";
import { mockProducts } from "@/data/mock";
import { Button } from "@/components/common/Button";

export default function ShopPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc">(
    "name"
  );

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

  const filteredProducts = useMemo(() => {
    let filtered = mockProducts;

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.categoryId === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
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

    return filtered;
  }, [selectedCategory, searchTerm, sortBy]);

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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Categories Filter */}
          <div className="mb-6">
            <h3 className="font-semibold text-sm mb-2">Categorías</h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory(null)}
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
                  onClick={() => setSelectedCategory(cat.id)}
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
              onChange={(e) =>
                setSortBy(e.target.value as "name" | "price-asc" | "price-desc")
              }
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
          <div className="mb-6 flex justify-between items-center">
            <p className="text-gray-600">
              Mostrando {filteredProducts.length} productos
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">No se encontraron productos</p>
              <Button
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchTerm("");
                }}
                className="mt-4"
              >
                Restablecer Filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} hideAddToCart />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
