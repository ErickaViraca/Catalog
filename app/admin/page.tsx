"use client";

import { useState, useEffect, useMemo, ChangeEvent } from "react";
import { mockBanners } from "@/data/mock";
import { Button } from "@/components/common/Button";
import { ImagePlaceholder } from "@/components/common/ImagePlaceholder";
import { useToast } from "@/components/common/ToastProvider";
import { Input, Textarea, Select, Switch } from "@/components/form";
import { SortableHeader } from "@/components/admin/SortableHeader";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { AlertModal } from "@/components/common/AlertModal";
import { Modal } from "@/components/common/Modal";
import { PencilIcon, TrashIcon } from "@/components/common/icons";
import { FORM_STYLES } from "@/src/config/ui";
import { slugify, truncateSlugWords, randomSlugSuffix } from "@/src/lib/slugify";
import { sortRows, SortDirection, SortState } from "@/src/lib/sortRows";
import { BRAND_IN_USE_MESSAGE, CATEGORY_IN_USE_MESSAGE } from "@/src/lib/deleteMessages";
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

type Tab = "brands" | "products" | "categories" | "banners" | "config";

const TAB_LABELS: Record<Tab, string> = {
  brands: "Marcas",
  products: "Productos",
  categories: "Categorías",
  banners: "Banners",
  config: "Configuración",
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
    active: true,
  });

  const brandValidators = {
    name: combine(required("El nombre"), minLength(2, "El nombre")),
  };

  // Form del modal de edición de marca — separado de newBrand (que es
  // solo para crear), así ambos formularios no se pisan entre sí.
  const [editBrandForm, setEditBrandForm] = useState({
    name: "",
    slug: "",
    logo: "",
    description: "",
    active: true,
  });
  const [editBrandSubmitAttempted, setEditBrandSubmitAttempted] = useState(false);

  const [newCategory, setNewCategory] = useState({
    name: "",
    slug: "",
    image: "",
    description: "",
    active: true,
  });

  const categoryValidators = {
    name: combine(required("El nombre"), minLength(2, "El nombre")),
  };

  // Form del modal de edición de categoría — separado de newCategory
  const [editCategoryForm, setEditCategoryForm] = useState({
    name: "",
    slug: "",
    image: "",
    description: "",
    active: true,
  });
  const [editCategorySubmitAttempted, setEditCategorySubmitAttempted] = useState(false);

  // Ordenamiento de tablas: null = orden por defecto (el que devuelve la API)
  const [brandSort, setBrandSort] = useState<SortState | null>(null);
  const [categorySort, setCategorySort] = useState<SortState | null>(null);
  const [productSort, setProductSort] = useState<SortState | null>(null);

  // Clickear la misma flecha activa vuelve al orden por defecto
  function toggleSort(
    setSort: (updater: (prev: SortState | null) => SortState | null) => void
  ) {
    return (key: string, direction: SortDirection) => {
      setSort((prev) =>
        prev?.key === key && prev.direction === direction ? null : { key, direction }
      );
    };
  }

  const handleBrandSort = toggleSort(setBrandSort);
  const handleCategorySort = toggleSort(setCategorySort);
  const handleProductSort = toggleSort(setProductSort);

  // Modal de confirmación de eliminación (reemplaza confirm() nativo)
  const [confirmDelete, setConfirmDelete] = useState<{
    type: "brand" | "category" | "product";
    id: string;
    name: string;
  } | null>(null);
  // Si el item está en uso por productos, no se pide confirmación: se avisa directo
  const [blockedDeleteMessage, setBlockedDeleteMessage] = useState<string | null>(null);
  const [deleteChecking, setDeleteChecking] = useState(false);

  const requestDeleteBrand = async (brand: any) => {
    setDeleteChecking(true);
    try {
      const response = await fetch(`/api/products?brandId=${brand.id}`);
      const data = await response.json();
      if (data.success && data.count > 0) {
        setBlockedDeleteMessage(BRAND_IN_USE_MESSAGE);
        return;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteChecking(false);
    }
    setConfirmDelete({ type: "brand", id: brand.id, name: brand.name });
  };

  const requestDeleteCategory = async (category: any) => {
    setDeleteChecking(true);
    try {
      const response = await fetch(`/api/products?categoryId=${category.id}`);
      const data = await response.json();
      if (data.success && data.count > 0) {
        setBlockedDeleteMessage(CATEGORY_IN_USE_MESSAGE);
        return;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteChecking(false);
    }
    setConfirmDelete({ type: "category", id: category.id, name: category.name });
  };

  const requestDeleteProduct = (product: any) => {
    setConfirmDelete({ type: "product", id: product.id, name: product.name });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    const { type, id } = confirmDelete;
    setConfirmDelete(null);
    if (type === "brand") await handleDeleteBrand(id);
    else if (type === "category") await handleDeleteCategory(id);
    else await handleDeleteProduct(id);
  };

  const confirmDeleteCopy = {
    brand: { title: "Eliminar marca", noun: "la marca" },
    category: { title: "Eliminar categoría", noun: "la categoría" },
    product: { title: "Eliminar producto", noun: "el producto" },
  } as const;

  // Cargar brands, categories, products y company del API
  useEffect(() => {
    fetchBrands();
    fetchCategories();
    fetchProducts();
    fetchCompany();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/brands?includeInactive=true");
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
      const response = await fetch("/api/categories?includeInactive=true");
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

  const [companyLoading, setCompanyLoading] = useState(false);
  const [companySubmitAttempted, setCompanySubmitAttempted] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    name: "",
    dollarPriceBs: "",
    phones: [""],
    addresses: [""],
  });

  const companyValidators = {
    name: combine(required("El nombre"), minLength(2, "El nombre")),
    dollarPriceBs: (value: unknown) => {
      const num = Number(value);
      if (!value || Number.isNaN(num) || num <= 0) {
        return "El valor del dólar debe ser mayor a 0";
      }
      return null;
    },
  };

  const fetchCompany = async () => {
    try {
      setCompanyLoading(true);
      const response = await fetch("/api/company");
      const data = await response.json();

      if (data.success) {
        setCompanyForm({
          name: data.data.name,
          dollarPriceBs: data.data.dollarPriceBs,
          phones: data.data.phones.length ? data.data.phones : [""],
          addresses: data.data.addresses.length ? data.data.addresses : [""],
        });
      } else {
        showError(data.error || "Error al obtener la configuración");
      }
    } catch (err) {
      showError("Error al conectar con el servidor");
      console.error(err);
    } finally {
      setCompanyLoading(false);
    }
  };

  const updatePhoneAt = (index: number, value: string) => {
    setCompanyForm((prev) => {
      const phones = [...prev.phones];
      phones[index] = value;
      return { ...prev, phones };
    });
  };
  const addPhone = () =>
    setCompanyForm((prev) => ({ ...prev, phones: [...prev.phones, ""] }));
  const removePhone = (index: number) =>
    setCompanyForm((prev) => ({
      ...prev,
      phones: prev.phones.filter((_, i) => i !== index),
    }));

  const updateAddressAt = (index: number, value: string) => {
    setCompanyForm((prev) => {
      const addresses = [...prev.addresses];
      addresses[index] = value;
      return { ...prev, addresses };
    });
  };
  const addAddress = () =>
    setCompanyForm((prev) => ({ ...prev, addresses: [...prev.addresses, ""] }));
  const removeAddress = (index: number) =>
    setCompanyForm((prev) => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index),
    }));

  const handleUpdateCompany = async () => {
    setCompanySubmitAttempted(true);
    const errors = validateForm(companyForm, companyValidators);
    if (Object.keys(errors).length > 0) {
      showError("Revisa los campos marcados en rojo");
      return;
    }

    const phones = companyForm.phones.map((phone) => phone.trim()).filter(Boolean);
    const addresses = companyForm.addresses
      .map((address) => address.trim())
      .filter(Boolean);

    if (phones.length === 0) {
      showError("Debe haber al menos un teléfono de contacto");
      return;
    }
    if (addresses.length === 0) {
      showError("Debe haber al menos una dirección");
      return;
    }

    try {
      setCompanyLoading(true);
      const response = await fetch("/api/company", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: companyForm.name,
          dollarPriceBs: companyForm.dollarPriceBs,
          phones,
          addresses,
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchCompany();
        showSuccess("¡Configuración actualizada exitosamente!");
      } else {
        showError(data.error || "Error al actualizar la configuración");
      }
    } catch (err) {
      showError("Error al guardar la configuración");
      console.error(err);
    } finally {
      setCompanyLoading(false);
      setCompanySubmitAttempted(false);
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
    active: true,
    featured: false,
    isNew: true,
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

  // Form del modal de edición de producto — separado de newProduct
  const [editProductForm, setEditProductForm] = useState({
    name: "",
    code: "",
    slug: "",
    description: "",
    price: 0,
    stock: 0,
    sku: "",
    categoryId: "",
    brandId: "",
    active: true,
    featured: false,
    isNew: true,
    imageUrl: "",
  });
  const [editProductSubmitAttempted, setEditProductSubmitAttempted] = useState(false);
  const [editProductImageUploading, setEditProductImageUploading] = useState(false);

  const handleAddBrand = async () => {
    setBrandSubmitAttempted(true);
    const errors = validateForm(newBrand, brandValidators);
    if (Object.keys(errors).length > 0) {
      showError("Revisa los campos marcados en rojo");
      return;
    }

    try {
      setLoading(true);

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

      setNewBrand({ name: "", slug: "", logo: "", description: "", active: true });
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
    setEditBrandForm({
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo || "",
      description: brand.description || "",
      active: brand.active,
    });
    setEditBrandSubmitAttempted(false);
  };

  const handleSaveEditBrand = async () => {
    setEditBrandSubmitAttempted(true);
    const errors = validateForm(editBrandForm, brandValidators);
    if (Object.keys(errors).length > 0) {
      showError("Revisa los campos marcados en rojo");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/brands", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingBrand.id, ...editBrandForm }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchBrands();
        setEditingBrand(null);
        showSuccess("¡Marca actualizada exitosamente!");
      } else {
        showError(data.error || "Error al actualizar la marca");
      }
    } catch (err) {
      showError("Error al guardar la marca");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBrand = async (id: string) => {
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

      setNewCategory({ name: "", slug: "", image: "", description: "", active: true });
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
    setEditCategoryForm({
      name: category.name,
      slug: category.slug,
      image: category.image || "",
      description: category.description || "",
      active: category.active,
    });
    setEditCategorySubmitAttempted(false);
  };

  const handleSaveEditCategory = async () => {
    setEditCategorySubmitAttempted(true);
    const errors = validateForm(editCategoryForm, categoryValidators);
    if (Object.keys(errors).length > 0) {
      showError("Revisa los campos marcados en rojo");
      return;
    }

    try {
      setCategoriesLoading(true);
      const response = await fetch("/api/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingCategory.id, ...editCategoryForm }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchCategories();
        setEditingCategory(null);
        showSuccess("¡Categoría actualizada exitosamente!");
      } else {
        showError(data.error || "Error al actualizar la categoría");
      }
    } catch (err) {
      showError("Error al guardar la categoría");
      console.error(err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
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
        active: true,
        featured: false,
        isNew: true,
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
    setEditProductForm({
      name: product.name,
      code: product.code,
      slug: product.slug,
      description: product.description,
      price: Number(product.price),
      stock: product.stock,
      sku: product.sku,
      categoryId: product.categoryId,
      brandId: product.brandId,
      active: product.active,
      featured: product.featured,
      isNew: product.isNew,
      imageUrl: product.imageUrl || "",
    });
    setEditProductSubmitAttempted(false);
  };

  const handleSaveEditProduct = async () => {
    setEditProductSubmitAttempted(true);
    const errors = validateForm(editProductForm, productValidators);
    if (Object.keys(errors).length > 0) {
      showError("Revisa los campos marcados en rojo");
      return;
    }

    try {
      setProductsLoading(true);
      const response = await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingProduct.id, ...editProductForm }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchProducts();
        setEditingProduct(null);
        showSuccess("¡Producto actualizado exitosamente!");
      } else {
        showError(data.error || "Error al actualizar el producto");
      }
    } catch (err) {
      showError("Error al guardar el producto");
      console.error(err);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
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

  const handleEditProductImageUpload = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setEditProductImageUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setEditProductForm((prev) => ({ ...prev, imageUrl: data.data.url }));
      } else {
        showError(data.error || "Error al subir la imagen");
      }
    } catch (err) {
      showError("Error al subir la imagen");
      console.error(err);
    } finally {
      setEditProductImageUploading(false);
      e.target.value = "";
    }
  };

  const sortedBrands = useMemo(
    () =>
      sortRows(brands, brandSort, {
        name: (b) => (b.name ?? "").toLowerCase(),
        active: (b) => (b.active ? 1 : 0),
      }),
    [brands, brandSort]
  );

  const sortedCategories = useMemo(
    () =>
      sortRows(categories, categorySort, {
        name: (c) => (c.name ?? "").toLowerCase(),
        active: (c) => (c.active ? 1 : 0),
      }),
    [categories, categorySort]
  );

  const sortedProducts = useMemo(
    () =>
      sortRows(products, productSort, {
        name: (p) => (p.name ?? "").toLowerCase(),
        price: (p) => Number(p.price) || 0,
        stock: (p) => Number(p.stock) || 0,
        category: (p) =>
          (categories.find((c) => c.id === p.categoryId)?.name ?? "").toLowerCase(),
      }),
    [products, productSort, categories]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Panel de Administración</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b">
        {(["brands", "products", "categories", "banners", "config"] as Tab[]).map((tab) => (
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
            <h2 className="text-2xl font-bold mb-6">Agregar Nueva Marca</h2>
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
            <div className="mb-4">
              <Switch
                label="Marca activa"
                checked={newBrand.active}
                onChange={(active) => setNewBrand({ ...newBrand, active })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddBrand} disabled={loading}>
                {loading ? "Guardando..." : "Agregar Marca"}
              </Button>
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
                    <SortableHeader
                      label="Nombre"
                      sortKey="name"
                      currentSort={brandSort}
                      onSort={handleBrandSort}
                    />
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Slug
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Descripción
                    </th>
                    <SortableHeader
                      label="Estado"
                      sortKey="active"
                      currentSort={brandSort}
                      onSort={handleBrandSort}
                    />
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedBrands.map((brand) => (
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
                          <button
                            type="button"
                            onClick={() => handleEditBrand(brand)}
                            disabled={loading}
                            aria-label="Editar marca"
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <PencilIcon size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => requestDeleteBrand(brand)}
                            disabled={loading || deleteChecking}
                            aria-label="Eliminar marca"
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-danger text-white hover:bg-danger/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <TrashIcon size={16} />
                          </button>
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
            <h2 className="text-2xl font-bold mb-6">Agregar Nuevo Producto</h2>
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
                helperText="Código del fabricante, máx 50 caracteres"
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
            </div>

            <div className="mb-4 flex flex-wrap gap-6">
              <Switch
                label="Producto activo"
                checked={newProduct.active}
                onChange={(active) => setNewProduct({ ...newProduct, active })}
              />
              <Switch
                label="Producto destacado"
                checked={newProduct.featured}
                onChange={(featured) => setNewProduct({ ...newProduct, featured })}
              />
              <Switch
                label="Producto nuevo"
                checked={newProduct.isNew}
                onChange={(isNew) => setNewProduct({ ...newProduct, isNew })}
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
                {productsLoading ? "Guardando..." : "Agregar Producto"}
              </Button>
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
                    <SortableHeader
                      label="Nombre"
                      sortKey="name"
                      currentSort={productSort}
                      onSort={handleProductSort}
                    />
                    <SortableHeader
                      label="Precio"
                      sortKey="price"
                      currentSort={productSort}
                      onSort={handleProductSort}
                    />
                    <SortableHeader
                      label="Stock"
                      sortKey="stock"
                      currentSort={productSort}
                      onSort={handleProductSort}
                    />
                    <SortableHeader
                      label="Categoría"
                      sortKey="category"
                      currentSort={productSort}
                      onSort={handleProductSort}
                    />
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedProducts.map((product) => (
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
                          <button
                            type="button"
                            onClick={() => handleEditProduct(product)}
                            disabled={productsLoading}
                            aria-label="Editar producto"
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <PencilIcon size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => requestDeleteProduct(product)}
                            disabled={productsLoading}
                            aria-label="Eliminar producto"
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-danger text-white hover:bg-danger/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <TrashIcon size={16} />
                          </button>
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
            <h2 className="text-2xl font-bold mb-6">Agregar Nueva Categoría</h2>
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
              <Textarea
                label="Descripción"
                value={newCategory.description}
                onChange={(description) =>
                  setNewCategory({ ...newCategory, description })
                }
              />
            </div>
            <div className="mb-4">
              <Switch
                label="Categoría activa"
                checked={newCategory.active}
                onChange={(active) => setNewCategory({ ...newCategory, active })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddCategory} disabled={categoriesLoading}>
                {categoriesLoading ? "Guardando..." : "Agregar Categoría"}
              </Button>
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
                    <SortableHeader
                      label="Nombre"
                      sortKey="name"
                      currentSort={categorySort}
                      onSort={handleCategorySort}
                    />
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Slug
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Descripción
                    </th>
                    <SortableHeader
                      label="Estado"
                      sortKey="active"
                      currentSort={categorySort}
                      onSort={handleCategorySort}
                    />
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCategories.map((cat) => (
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
                          <button
                            type="button"
                            onClick={() => handleEditCategory(cat)}
                            disabled={categoriesLoading}
                            aria-label="Editar categoría"
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <PencilIcon size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => requestDeleteCategory(cat)}
                            disabled={categoriesLoading || deleteChecking}
                            aria-label="Eliminar categoría"
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-danger text-white hover:bg-danger/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <TrashIcon size={16} />
                          </button>
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

      {/* Configuración Tab */}
      {activeTab === "config" && (
        <div className={`bg-white rounded-lg shadow ${FORM_STYLES.cardPadding} max-w-3xl`}>
          <h2 className="text-2xl font-bold mb-6">Configuración</h2>
          {companyLoading && !companyForm.name ? (
            <div className="px-6 py-8 text-center text-gray-500">
              Cargando configuración...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Input
                  label="Nombre de la Empresa"
                  required
                  value={companyForm.name}
                  validate={companyValidators.name}
                  forceTouched={companySubmitAttempted}
                  helperText="Se muestra en el header y el footer del sitio"
                  onChange={(name) => setCompanyForm((prev) => ({ ...prev, name }))}
                />
                <Input
                  label="Valor del Dólar (Bs)"
                  required
                  type="number"
                  value={companyForm.dollarPriceBs}
                  validate={companyValidators.dollarPriceBs}
                  forceTouched={companySubmitAttempted}
                  helperText="Cotización para conversión USD → Bs"
                  onChange={(value) =>
                    setCompanyForm((prev) => ({ ...prev, dollarPriceBs: value }))
                  }
                />
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-sm mb-2 text-label">
                  Teléfonos de Contacto
                </h3>
                <div className="space-y-2">
                  {companyForm.phones.map((phone, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        id={`phone-${index}`}
                        value={phone}
                        onChange={(value) => updatePhoneAt(index, value)}
                      />
                      {companyForm.phones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePhone(index)}
                          className="text-sm text-danger hover:underline px-2 shrink-0"
                        >
                          Quitar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addPhone}
                  className="text-sm text-primary hover:underline mt-2"
                >
                  + Agregar teléfono
                </button>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-sm mb-2 text-label">Direcciones</h3>
                <div className="space-y-2">
                  {companyForm.addresses.map((address, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        id={`address-${index}`}
                        value={address}
                        onChange={(value) => updateAddressAt(index, value)}
                      />
                      {companyForm.addresses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAddress(index)}
                          className="text-sm text-danger hover:underline px-2 shrink-0"
                        >
                          Quitar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addAddress}
                  className="text-sm text-primary hover:underline mt-2"
                >
                  + Agregar dirección
                </button>
              </div>

              <Button onClick={handleUpdateCompany} disabled={companyLoading}>
                {companyLoading ? "Guardando..." : "Guardar Configuración"}
              </Button>
            </>
          )}
        </div>
      )}

      <ConfirmModal
        open={!!confirmDelete}
        title={confirmDelete ? confirmDeleteCopy[confirmDelete.type].title : ""}
        message={
          confirmDelete
            ? `¿Estás seguro de que deseas eliminar ${confirmDeleteCopy[confirmDelete.type].noun} "${confirmDelete.name}"? Esta acción no se puede deshacer.`
            : ""
        }
        confirmLabel="Eliminar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(null)}
      />

      <AlertModal
        open={!!blockedDeleteMessage}
        title="No se puede eliminar"
        message={blockedDeleteMessage || ""}
        onClose={() => setBlockedDeleteMessage(null)}
      />

      <Modal
        open={!!editingBrand}
        title="Editar Marca"
        onCancel={() => setEditingBrand(null)}
        onSave={handleSaveEditBrand}
        saving={loading}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input
            label="Nombre de la Marca"
            required
            value={editBrandForm.name}
            validate={brandValidators.name}
            forceTouched={editBrandSubmitAttempted}
            onChange={(name) => setEditBrandForm((prev) => ({ ...prev, name }))}
          />
          <Input
            label="URL del Logo"
            value={editBrandForm.logo}
            onChange={(logo) => setEditBrandForm((prev) => ({ ...prev, logo }))}
          />
          <Textarea
            label="Descripción"
            value={editBrandForm.description}
            onChange={(description) =>
              setEditBrandForm((prev) => ({ ...prev, description }))
            }
          />
        </div>
        <Switch
          label="Marca activa"
          checked={editBrandForm.active}
          onChange={(active) => setEditBrandForm((prev) => ({ ...prev, active }))}
        />
      </Modal>

      <Modal
        open={!!editingCategory}
        title="Editar Categoría"
        onCancel={() => setEditingCategory(null)}
        onSave={handleSaveEditCategory}
        saving={categoriesLoading}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input
            label="Nombre de la Categoría"
            required
            value={editCategoryForm.name}
            validate={categoryValidators.name}
            forceTouched={editCategorySubmitAttempted}
            onChange={(name) => setEditCategoryForm((prev) => ({ ...prev, name }))}
          />
          <Textarea
            label="Descripción"
            value={editCategoryForm.description}
            onChange={(description) =>
              setEditCategoryForm((prev) => ({ ...prev, description }))
            }
          />
        </div>
        <Switch
          label="Categoría activa"
          checked={editCategoryForm.active}
          onChange={(active) => setEditCategoryForm((prev) => ({ ...prev, active }))}
        />
      </Modal>

      <Modal
        open={!!editingProduct}
        title="Editar Producto"
        onCancel={() => setEditingProduct(null)}
        onSave={handleSaveEditProduct}
        saving={productsLoading}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input
            label="Nombre del Producto"
            required
            value={editProductForm.name}
            validate={productValidators.name}
            forceTouched={editProductSubmitAttempted}
            onChange={(name) => setEditProductForm((prev) => ({ ...prev, name }))}
          />
          <Input
            label="Código de Fabricante"
            required
            value={editProductForm.code}
            validate={productValidators.code}
            forceTouched={editProductSubmitAttempted}
            maxLength={50}
            helperText="Código del fabricante, máx 50 caracteres"
            onChange={(code) => setEditProductForm((prev) => ({ ...prev, code }))}
          />
          <Input
            label="Código de Inventario"
            required
            value={editProductForm.sku}
            validate={productValidators.sku}
            forceTouched={editProductSubmitAttempted}
            maxLength={10}
            helperText="Máximo 10 caracteres, único por producto"
            onChange={(sku) => setEditProductForm((prev) => ({ ...prev, sku }))}
          />
          <Input
            label="Precio"
            required
            type="number"
            value={editProductForm.price}
            validate={productValidators.price}
            forceTouched={editProductSubmitAttempted}
            helperText="En USD, ej: 89.99"
            onChange={(value) =>
              setEditProductForm((prev) => ({ ...prev, price: parseFloat(value) || 0 }))
            }
          />
          <Input
            label="Stock"
            type="number"
            value={editProductForm.stock}
            validate={productValidators.stock}
            forceTouched={editProductSubmitAttempted}
            onChange={(value) =>
              setEditProductForm((prev) => ({ ...prev, stock: parseInt(value) || 0 }))
            }
          />
          <Select
            label="Categoría"
            required
            value={editProductForm.categoryId}
            validate={productValidators.categoryId}
            forceTouched={editProductSubmitAttempted}
            onChange={(categoryId) =>
              setEditProductForm((prev) => ({ ...prev, categoryId }))
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
            value={editProductForm.brandId}
            validate={productValidators.brandId}
            forceTouched={editProductSubmitAttempted}
            onChange={(brandId) => setEditProductForm((prev) => ({ ...prev, brandId }))}
          >
            <option value="">Selecciona una marca</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="mb-4 flex flex-wrap gap-6">
          <Switch
            label="Producto activo"
            checked={editProductForm.active}
            onChange={(active) => setEditProductForm((prev) => ({ ...prev, active }))}
          />
          <Switch
            label="Producto destacado"
            checked={editProductForm.featured}
            onChange={(featured) => setEditProductForm((prev) => ({ ...prev, featured }))}
          />
          <Switch
            label="Producto nuevo"
            checked={editProductForm.isNew}
            onChange={(isNew) => setEditProductForm((prev) => ({ ...prev, isNew }))}
          />
        </div>

        <div className="mb-4">
          <Textarea
            label="Descripción"
            required
            value={editProductForm.description}
            validate={productValidators.description}
            forceTouched={editProductSubmitAttempted}
            onChange={(description) =>
              setEditProductForm((prev) => ({ ...prev, description }))
            }
          />
        </div>

        <div>
          <h3 className="font-semibold text-sm mb-2 text-label">Imagen del Producto</h3>
          <div className="flex items-center gap-4">
            {editProductForm.imageUrl ? (
              <img
                src={editProductForm.imageUrl}
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
                onChange={handleEditProductImageUpload}
                disabled={editProductImageUploading}
                className="text-sm"
              />
              {editProductImageUploading && (
                <p className="text-sm text-muted mt-1">Subiendo imagen...</p>
              )}
              {editProductForm.imageUrl && !editProductImageUploading && (
                <button
                  type="button"
                  onClick={() =>
                    setEditProductForm((prev) => ({ ...prev, imageUrl: "" }))
                  }
                  className="text-sm text-danger hover:underline mt-1"
                >
                  Quitar imagen
                </button>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
