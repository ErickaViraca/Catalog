"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { mockBanners } from "@/data/mock";
import { Button } from "@/components/common/Button";
import { ImagePlaceholder } from "@/components/common/ImagePlaceholder";
import { useToast } from "@/components/common/ToastProvider";
import { Input, Textarea, Select, Checkbox } from "@/components/form";
import { FORM_STYLES } from "@/src/config/ui";
import { slugify, truncateSlugWords, randomSlugSuffix } from "@/src/lib/slugify";
import {
  combine,
  required,
  minLength,
  maxLength,
  alphanumericFormat,
  nonNegativeInteger,
  selected,
  validateForm,
} from "@/src/lib/validators";

type Tab = "brands" | "products" | "categories" | "banners";

const TAB_LABELS: Record<Tab, string> = {
  brands: "Marcas",
  products: "Productos",
  categories: "Categorías",
  banners: "Banners",
};

export default function AdminPage() {
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("brands");
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [brandSubmitAttempted, setBrandSubmitAttempted] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productSubmitAttempted, setProductSubmitAttempted] = useState(false);
  const [productImageUploading, setProductImageUploading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categorySubmitAttempted, setCategorySubmitAttempted] = useState(false);
  const [banners, setBanners] = useState<any[]>(mockBanners);
  const [editingBrand, setEditingBrand] = useState<any>(null);

  // Mientras el usuario no edite el slug a mano, se autogenera a partir del nombre
  const [brandSlugTouched, setBrandSlugTouched] = useState(false);
  const [categorySlugTouched, setCategorySlugTouched] = useState(false);
  // El slug de products no es un campo editable: se autogenera con las
  // primeras 2 palabras del nombre + un sufijo aleatorio fijo por borrador
  const [productSlugTouched, setProductSlugTouched] = useState(false);
  const [productSlugSuffix, setProductSlugSuffix] = useState(() => randomSlugSuffix());

  const [newBrand, setNewBrand] = useState({
    name: "",
    slug: "",
    logo: "",
    description: "",
  });

  const brandValidators = {
    name: combine(required("El nombre"), minLength(2, "El nombre")),
  };

  const [newCategory, setNewCategory] = useState({
    name: "",
    slug: "",
    image: "",
    description: "",
  });

  const categoryValidators = {
    name: combine(required("El nombre"), minLength(2, "El nombre")),
  };

  // Cargar brands, categories y products del API
  useEffect(() => {
    fetchBrands();
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/brands");
      const data = await response.json();

      if (data.success) {
        setBrands(data.data);
      } else {
        showError(data.error || "Error al obtener las marcas");
      }
    } catch (err) {
      showError("Error al conectar con el servidor");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await fetch("/api/categories");
      const data = await response.json();

      if (data.success) {
        setCategories(data.data);
      } else {
        showError(data.error || "Error al obtener las categorías");
      }
    } catch (err) {
      showError("Error al conectar con el servidor");
      console.error(err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await fetch("/api/products");
      const data = await response.json();

      if (data.success) {
        setProducts(data.data);
      } else {
        showError(data.error || "Error al obtener los productos");
      }
    } catch (err) {
      showError("Error al conectar con el servidor");
      console.error(err);
    } finally {
      setProductsLoading(false);
    }
  };

  const [newProduct, setNewProduct] = useState({
    name: "",
    code: "",
    slug: "",
    description: "",
    price: 0,
    stock: 0,
    sku: "",
    categoryId: categories[0]?.id || "",
    brandId: brands[0]?.id || "",
    featured: false,
    imageUrl: "",
  });

  const productValidators = {
    name: combine(required("El nombre"), minLength(2, "El nombre")),
    code: combine(
      required("El código de fabricante"),
      maxLength(50, "El código de fabricante"),
      alphanumericFormat("El código de fabricante")
    ),
    description: combine(required("La descripción"), minLength(10, "La descripción")),
    price: (value: unknown) => {
      const num = Number(value);
      if (!value || Number.isNaN(num) || num <= 0) {
        return "El precio debe ser mayor a 0";
      }
      return null;
    },
    stock: nonNegativeInteger("El stock"),
    sku: combine(
      required("El código de inventario"),
      maxLength(10, "El código de inventario"),
      (value: unknown) => {
        if (typeof value !== "string" || value.trim().length === 0) return null;
        const isDuplicate = products.some(
          (p) =>
            p.sku?.toLowerCase() === value.toLowerCase() &&
            p.id !== editingProduct?.id
        );
        return isDuplicate ? "Ese código de inventario ya está en uso" : null;
      }
    ),
    categoryId: selected("una categoría"),
    brandId: selected("una marca"),
  };

  const handleAddBrand = async () => {
    setBrandSubmitAttempted(true);
    const errors = validateForm(newBrand, brandValidators);
    if (Object.keys(errors).length > 0) {
      showError("Revisa los campos marcados en rojo");
      return;
    }

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
          showSuccess("¡Marca actualizada exitosamente!");
        } else {
          showError(data.error || "Error al actualizar la marca");
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
          showSuccess("¡Marca creada exitosamente!");
        } else {
          showError(data.error || "Error al crear la marca");
        }
      }

      setNewBrand({ name: "", slug: "", logo: "", description: "" });
      setBrandSlugTouched(false);
      setBrandSubmitAttempted(false);
    } catch (err) {
      showError("Error al guardar la marca");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditBrand = (brand: any) => {
    setEditingBrand(brand);
    setNewBrand(brand);
    setBrandSlugTouched(true);
    setBrandSubmitAttempted(false);
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
        showSuccess("¡Marca eliminada exitosamente!");
      } else {
        showError(data.error || "Error al eliminar la marca");
      }
    } catch (err) {
      showError("Error al eliminar la marca");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    setCategorySubmitAttempted(true);
    const errors = validateForm(newCategory, categoryValidators);
    if (Object.keys(errors).length > 0) {
      showError("Revisa los campos marcados en rojo");
      return;
    }

    try {
      setCategoriesLoading(true);

      if (editingCategory) {
        // Actualizar category existente
        const response = await fetch("/api/categories", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingCategory.id, ...newCategory }),
        });

        const data = await response.json();
        if (data.success) {
          await fetchCategories();
          setEditingCategory(null);
          showSuccess("¡Categoría actualizada exitosamente!");
        } else {
          showError(data.error || "Error al actualizar la categoría");
        }
      } else {
        // Crear nueva category
        const response = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newCategory),
        });

        const data = await response.json();
        if (data.success) {
          await fetchCategories();
          showSuccess("¡Categoría creada exitosamente!");
        } else {
          showError(data.error || "Error al crear la categoría");
        }
      }

      setNewCategory({ name: "", slug: "", image: "", description: "" });
      setCategorySlugTouched(false);
      setCategorySubmitAttempted(false);
    } catch (err) {
      showError("Error al guardar la categoría");
      console.error(err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      slug: category.slug,
      image: category.image || "",
      description: category.description || "",
    });
    setCategorySlugTouched(true);
    setCategorySubmitAttempted(false);
    setActiveTab("categories");
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta categoría?")) return;

    try {
      setCategoriesLoading(true);
      const response = await fetch("/api/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchCategories();
        showSuccess("¡Categoría eliminada exitosamente!");
      } else {
        showError(data.error || "Error al eliminar la categoría");
      }
    } catch (err) {
      showError("Error al eliminar la categoría");
      console.error(err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleAddProduct = async () => {
    setProductSubmitAttempted(true);
    const errors = validateForm(newProduct, productValidators);
    if (Object.keys(errors).length > 0) {
      showError("Revisa los campos marcados en rojo");
      return;
    }

    try {
      setProductsLoading(true);

      if (editingProduct) {
        // Actualizar product existente
        const response = await fetch("/api/products", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingProduct.id, ...newProduct }),
        });

        const data = await response.json();
        if (data.success) {
          await fetchProducts();
          setEditingProduct(null);
          showSuccess("¡Producto actualizado exitosamente!");
        } else {
          showError(data.error || "Error al actualizar el producto");
        }
      } else {
        // Crear nuevo product
        const response = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newProduct),
        });

        const data = await response.json();
        if (data.success) {
          await fetchProducts();
          showSuccess("¡Producto agregado exitosamente!");
        } else {
          showError(data.error || "Error al crear el producto");
        }
      }

      setNewProduct({
        name: "",
        code: "",
        slug: "",
        description: "",
        price: 0,
        stock: 0,
        sku: "",
        categoryId: categories[0]?.id || "",
        brandId: brands[0]?.id || "",
        featured: false,
        imageUrl: "",
      });
      setProductSlugTouched(false);
      setProductSubmitAttempted(false);
      setProductSlugSuffix(randomSlugSuffix());
    } catch (err) {
      showError("Error al guardar el producto");
      console.error(err);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      code: product.code,
      slug: product.slug,
      description: product.description,
      price: Number(product.price),
      stock: product.stock,
      sku: product.sku,
      categoryId: product.categoryId,
      brandId: product.brandId,
      featured: product.featured,
      imageUrl: product.imageUrl || "",
    });
    setProductSlugTouched(true);
    setProductSubmitAttempted(false);
    setActiveTab("products");
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) return;

    try {
      setProductsLoading(true);
      const response = await fetch("/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchProducts();
        showSuccess("¡Producto eliminado exitosamente!");
      } else {
        showError(data.error || "Error al eliminar el producto");
      }
    } catch (err) {
      showError("Error al eliminar el producto");
      console.error(err);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleProductImageUpload = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setProductImageUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setNewProduct((prev) => ({ ...prev, imageUrl: data.data.url }));
      } else {
        showError(data.error || "Error al subir la imagen");
      }
    } catch (err) {
      showError("Error al subir la imagen");
      console.error(err);
    } finally {
      setProductImageUploading(false);
      e.target.value = "";
    }
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
                ? "border-primary text-primary"
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
          <div className={`bg-white rounded-lg shadow ${FORM_STYLES.cardPadding} mb-8`}>
            <h2 className="text-2xl font-bold mb-6">
              {editingBrand ? "Editar Marca" : "Agregar Nueva Marca"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                label="Nombre de la Marca"
                required
                value={newBrand.name}
                validate={brandValidators.name}
                forceTouched={brandSubmitAttempted}
                onChange={(name) => {
                  setNewBrand((prev) => ({
                    ...prev,
                    name,
                    slug: brandSlugTouched ? prev.slug : slugify(name),
                  }));
                }}
              />
              <Input
                label="URL del Logo"
                value={newBrand.logo}
                onChange={(logo) => setNewBrand({ ...newBrand, logo })}
              />
              <Textarea
                label="Descripción"
                value={newBrand.description}
                onChange={(description) =>
                  setNewBrand({ ...newBrand, description })
                }
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
                    setBrandSlugTouched(false);
                    setBrandSubmitAttempted(false);
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
          <div className={`bg-white rounded-lg shadow ${FORM_STYLES.cardPadding} mb-8`}>
            <h2 className="text-2xl font-bold mb-6">
              {editingProduct ? "Editar Producto" : "Agregar Nuevo Producto"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                label="Nombre del Producto"
                required
                value={newProduct.name}
                validate={productValidators.name}
                forceTouched={productSubmitAttempted}
                onChange={(name) => {
                  if (productSlugTouched) {
                    setNewProduct((prev) => ({ ...prev, name }));
                    return;
                  }
                  const base = truncateSlugWords(slugify(name), 2);
                  const slug = base
                    ? `${base}-${productSlugSuffix}`
                    : productSlugSuffix;
                  setNewProduct((prev) => ({ ...prev, name, slug }));
                }}
              />
              <Input
                label="Código de Fabricante"
                required
                value={newProduct.code}
                validate={productValidators.code}
                forceTouched={productSubmitAttempted}
                maxLength={50}
                helperText="Código del fabricante (ej. Xiaomi), máx 50 caracteres"
                onChange={(code) => setNewProduct({ ...newProduct, code })}
              />
              <Input
                label="Código de Inventario"
                required
                value={newProduct.sku}
                validate={productValidators.sku}
                forceTouched={productSubmitAttempted}
                maxLength={10}
                helperText="Máximo 10 caracteres, único por producto"
                onChange={(sku) => setNewProduct({ ...newProduct, sku })}
              />
              <Input
                label="Precio"
                required
                type="number"
                value={newProduct.price}
                validate={productValidators.price}
                forceTouched={productSubmitAttempted}
                helperText="En USD, ej: 89.99"
                onChange={(value) =>
                  setNewProduct({ ...newProduct, price: parseFloat(value) || 0 })
                }
              />
              <Input
                label="Stock"
                type="number"
                value={newProduct.stock}
                validate={productValidators.stock}
                forceTouched={productSubmitAttempted}
                onChange={(value) =>
                  setNewProduct({ ...newProduct, stock: parseInt(value) || 0 })
                }
              />
              <Select
                label="Categoría"
                required
                value={newProduct.categoryId}
                validate={productValidators.categoryId}
                forceTouched={productSubmitAttempted}
                onChange={(categoryId) =>
                  setNewProduct({ ...newProduct, categoryId })
                }
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
              <Select
                label="Marca"
                required
                value={newProduct.brandId}
                validate={productValidators.brandId}
                forceTouched={productSubmitAttempted}
                onChange={(brandId) => setNewProduct({ ...newProduct, brandId })}
              >
                <option value="">Selecciona una marca</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </Select>
              <Checkbox
                label="Producto destacado"
                checked={newProduct.featured}
                onChange={(featured) => setNewProduct({ ...newProduct, featured })}
              />
            </div>

            <div className="mb-4">
              <Textarea
                label="Descripción"
                required
                value={newProduct.description}
                validate={productValidators.description}
                forceTouched={productSubmitAttempted}
                onChange={(description) =>
                  setNewProduct({ ...newProduct, description })
                }
              />
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-sm mb-2 text-label">Imagen del Producto</h3>
              <div className="flex items-center gap-4">
                {newProduct.imageUrl ? (
                  <img
                    src={newProduct.imageUrl}
                    alt="Vista previa"
                    className="w-16 h-16 object-cover rounded-lg border border-border"
                  />
                ) : (
                  <ImagePlaceholder size={64} />
                )}
                <div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    onChange={handleProductImageUpload}
                    disabled={productImageUploading}
                    className="text-sm"
                  />
                  {productImageUploading && (
                    <p className="text-sm text-muted mt-1">Subiendo imagen...</p>
                  )}
                  {newProduct.imageUrl && !productImageUploading && (
                    <button
                      type="button"
                      onClick={() =>
                        setNewProduct((prev) => ({ ...prev, imageUrl: "" }))
                      }
                      className="text-sm text-danger hover:underline mt-1"
                    >
                      Quitar imagen
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAddProduct}
                disabled={productsLoading || productImageUploading}
              >
                {productsLoading
                  ? "Guardando..."
                  : editingProduct
                    ? "Actualizar Producto"
                    : "Agregar Producto"}
              </Button>
              {editingProduct && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingProduct(null);
                    setNewProduct({
                      name: "",
                      code: "",
                      slug: "",
                      description: "",
                      price: 0,
                      stock: 0,
                      sku: "",
                      categoryId: categories[0]?.id || "",
                      brandId: brands[0]?.id || "",
                      featured: false,
                      imageUrl: "",
                    });
                    setProductSlugTouched(false);
                    setProductSubmitAttempted(false);
                    setProductSlugSuffix(randomSlugSuffix());
                  }}
                  disabled={productsLoading}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            {productsLoading && products.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                Cargando productos...
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Imagen
                    </th>
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
                      <td className="px-6 py-4">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg border border-gray-300"
                          />
                        ) : (
                          <ImagePlaceholder size={48} />
                        )}
                      </td>
                      <td className="px-6 py-4">{product.name}</td>
                      <td className="px-6 py-4">${Number(product.price).toFixed(2)}</td>
                      <td className="px-6 py-4">{product.stock}</td>
                      <td className="px-6 py-4">
                        {categories.find((c) => c.id === product.categoryId)?.name}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditProduct(product)}
                            disabled={productsLoading}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={productsLoading}
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
            {products.length === 0 && !productsLoading && (
              <div className="px-6 py-8 text-center text-gray-500">
                Aún no hay productos. ¡Crea tu primer producto!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <div>
          <div className={`bg-white rounded-lg shadow ${FORM_STYLES.cardPadding} mb-8`}>
            <h2 className="text-2xl font-bold mb-6">
              {editingCategory ? "Editar Categoría" : "Agregar Nueva Categoría"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                label="Nombre de la Categoría"
                required
                value={newCategory.name}
                validate={categoryValidators.name}
                forceTouched={categorySubmitAttempted}
                onChange={(name) => {
                  setNewCategory((prev) => ({
                    ...prev,
                    name,
                    slug: categorySlugTouched ? prev.slug : slugify(name),
                  }));
                }}
              />
              <Input
                label="URL de la Imagen"
                value={newCategory.image}
                onChange={(image) => setNewCategory({ ...newCategory, image })}
              />
              <Textarea
                label="Descripción"
                value={newCategory.description}
                onChange={(description) =>
                  setNewCategory({ ...newCategory, description })
                }
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddCategory} disabled={categoriesLoading}>
                {categoriesLoading
                  ? "Guardando..."
                  : editingCategory
                    ? "Actualizar Categoría"
                    : "Agregar Categoría"}
              </Button>
              {editingCategory && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingCategory(null);
                    setNewCategory({ name: "", slug: "", image: "", description: "" });
                    setCategorySlugTouched(false);
                    setCategorySubmitAttempted(false);
                  }}
                  disabled={categoriesLoading}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            {categoriesLoading && categories.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                Cargando categorías...
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
                  {categories.map((cat) => (
                    <tr key={cat.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold">{cat.name}</td>
                      <td className="px-6 py-4 text-gray-600">{cat.slug}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {cat.description || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            cat.active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {cat.active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditCategory(cat)}
                            disabled={categoriesLoading}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteCategory(cat.id)}
                            disabled={categoriesLoading}
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
            {categories.length === 0 && !categoriesLoading && (
              <div className="px-6 py-8 text-center text-gray-500">
                Aún no hay categorías. ¡Crea tu primera categoría!
              </div>
            )}
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
