"use client";

import { useState } from "react";
import { mockProducts, mockCategories, mockBanners } from "@/data/mock";
import { Button } from "@/components/common/Button";

type Tab = "products" | "categories" | "banners";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("products");
  const [products, setProducts] = useState(mockProducts);
  const [categories, setCategories] = useState(mockCategories);
  const [banners, setBanners] = useState(mockBanners);

  const [newProduct, setNewProduct] = useState({
    name: "",
    slug: "",
    description: "",
    price: 0,
    stock: 0,
    categoryId: categories[0]?.id || "",
  });

  const handleAddProduct = () => {
    if (!newProduct.name) return alert("Product name is required");

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
    alert("Product added successfully!");
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Admin Panel</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b">
        {(["products", "categories", "banners"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Products Tab */}
      {activeTab === "products" && (
        <div>
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">Add New Product</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Product Name"
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
                placeholder="Description"
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Price"
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
            <Button onClick={handleAddProduct}>Add Product</Button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Actions
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
                        Delete
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
          <h2 className="text-2xl font-bold mb-6">Categories</h2>
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
                <p className="text-gray-600 text-sm">Link: {banner.link || "No link"}</p>
                <p className="text-gray-600 text-sm">
                  Active: {banner.active ? "Yes" : "No"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
