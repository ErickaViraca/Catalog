import { Product } from "@/types";

// Adapta el shape que devuelve /api/products (imageUrl único, price como
// string) al tipo Product que espera ProductCard, pensado originalmente
// para datos mock (images en JSON, price numérico).
export function normalizeApiProduct(apiProduct: any): Product {
  return {
    id: apiProduct.id,
    name: apiProduct.name,
    slug: apiProduct.slug,
    description: apiProduct.description,
    price: Number(apiProduct.price),
    stock: apiProduct.stock,
    images: JSON.stringify(apiProduct.imageUrl ? [apiProduct.imageUrl] : []),
    categoryId: apiProduct.categoryId,
    createdAt: apiProduct.createdAt,
    updatedAt: apiProduct.updatedAt,
  };
}
