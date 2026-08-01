"use client";

import { useState, useEffect } from "react";
import { mockProducts, mockCategories, mockBanners } from "@/data/mock";
import { Button } from "@/components/common/Button";

type Tab = "brands" | "products" | "categories" | "banners";

const TAB_LABELS: Record<Tab, string> = {
  brands: "Marcas",
  products: "Productos",
  categories: "Categorías",
  banners: "Banners",
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("brands");
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>(mockProducts);
  const [categories, setCategories] = useState<any[]>(mockCategories);
  const [banners, setBanners] = useState<any[]>(mockBanners);
  const [editingBrand, setEditingBrand] = useState<any>(null);

  const [newBrand, setNewBrand] = useState({
    name: "",
    slug: "",
    logo: "",
    description: "",
  });

  // Cargar brands del API
  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/brands");
      const data = await response.json();

      if (data.success) {
        setBrands(data.data);
      } else {
        setError(data.error || "Error al obtener las marcas");
      }
    } catch (err) {
      setError("Error al conectar con el servidor");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const [newProduct, setNewProduct] = useState({
    name: "",
    slug: "",
    description: "",
    price: 0,
    stock: 0,
    categoryId: categories[0]?.id || "",
  });

  const handleAddBrand = async () => {
    if (!newBrand.name) return alert("El nombre de la marca es requerido");
    if (!newBrand.slug) return alert("El slug de la marca es requerido");

    try {
      setLoading(true);

      if (editingBrand) {
        // Actualizar brand existente
        const response = await fetch("/api/brands", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingBrand.id, ...newBrand }),
        });

        const data = await response.json();
        if (data.success) {
          await fetchBrands();
          setEditingBrand(null);
          alert("¡Marca actualizada exitosamente!");
        } else {
          setError(data.error || "Error al actualizar la marca");
        }
      } else {
        // Crear nuevo brand
        const response = await fetch("/api/brands", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newBrand),
        });

        const data = await response.json();
        if (data.success) {
          await fetchBrands();
          alert("¡Marca creada exitosamente!");
        } else {
          setError(data.error || "Error al crear la marca");
        }
      }

      setNewBrand({ name: "", slug: "", logo: "", description: "" });
    } catch (err) {
      setError("Error al guardar la marca");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditBrand = (brand: any) => {
    setEditingBrand(brand);
    setNewBrand(brand);
    setActiveTab("brands");
  };

  const handleDeleteBrand = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta marca?")) return;

    try {
      setLoading(true);
      const response = await fetch("/api/brands", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchBrands();
        alert("¡Marca eliminada exitosamente!");
      } else {
        setError(data.error || "Error al eliminar la marca");
      }
    } catch (err) {
      setError("Error al eliminar la marca");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    if (!newProduct.name) return alert("El nombre del producto es requerido");

    const product = {
      id: `prod-${Date.now()}`,
      ...newProduct,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1609034227505-5876f6aa4e90?w=500&h=500&fit=crop",
      ]),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setProducts([...products, product]);
    setNewProduct({
      name: "",
      slug: "",
      description: "",
      price: 0,
      stock: 0,
      categoryId: categories[0]?.id || "",
    });
    alert("¡Producto agregado exitosamente!");
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Panel de Administración</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b">
        {(["brands", "products", "categories", "banners"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Brands Tab */}
      {activeTab === "brands" && (
        <div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
              <button
                onClick={() => setError(null)}
                className="float-right font-bold text-red-700 hover:text-red-900"
              >
                ✕
              </button>
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">
              {editingBrand ? "Editar Marca" : "Agregar Nueva Marca"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Nombre de la Marca"
                value={newBrand.name}
                onChange={(e) =>
                  setNewBrand({ ...newBrand, name: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Slug"
                value={newBrand.slug}
                onChange={(e) =>
                  setNewBrand({ ...newBrand, slug: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="URL del Logo"
                value={newBrand.logo}
                onChange={(e) =>
                  setNewBrand({ ...newBrand, logo: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Descripción"
                value={newBrand.description}
                onChange={(e) =>
                  setNewBrand({ ...newBrand, description: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddBrand} disabled={loading}>
                {loading ? "Guardando..." : editingBrand ? "Actualizar Marca" : "Agregar Marca"}
              </Button>
              {editingBrand && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingBrand(null);
                    setNewBrand({ name: "", slug: "", logo: "", description: "" });
                  }}
                  disabled={loading}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading && brands.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                Cargando marcas...
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Slug
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {brands.map((brand) => (
                    <tr key={brand.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold">{brand.name}</td>
                      <td className="px-6 py-4 text-gray-600">{brand.slug}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {brand.description || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            brand.active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {brand.active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditBrand(brand)}
                            disabled={loading}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteBrand(brand.id)}
                            disabled={loading}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {brands.length === 0 && !loading && (
              <div className="px-6 py-8 text-center text-gray-500">
                Aún no hay marcas. ¡Crea tu primera marca!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === "products" && (
        <div>
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">Agregar Nuevo Producto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Nombre del Producto"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Slug"
                value={newProduct.slug}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, slug: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Descripción"
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Precio"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    price: parseFloat(e.target.value),
                  })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Stock"
                value={newProduct.stock}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    stock: parseInt(e.target.value),
                  })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={newProduct.categoryId}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, categoryId: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={handleAddProduct}>Agregar Producto</Button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">{product.name}</td>
                    <td className="px-6 py-4">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4">{product.stock}</td>
                    <td className="px-6 py-4">
                      {categories.find((c) => c.id === product.categoryId)?.name}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6">Categorías</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((cat) => (
              <div key={cat.id} className="border rounded-lg p-4">
                <h3 className="font-bold text-lg">{cat.name}</h3>
                <p className="text-gray-600 text-sm">Slug: {cat.slug}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Banners Tab */}
      {activeTab === "banners" && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6">Banners</h2>
          <div className="space-y-6">
            {banners.map((banner) => (
              <div key={banner.id} className="border rounded-lg p-4">
                <h3 className="font-bold text-lg">{banner.title}</h3>
                <p className="text-gray-600 text-sm">Enlace: {banner.link || "Sin enlace"}</p>
                <p className="text-gray-600 text-sm">
                  Activo: {banner.active ? "Sí" : "No"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
