import type {
  Product as DbProduct,
  Category as DbCategory,
  Brand as DbBrand,
} from "@/src/db/schema";

// Producto tal como lo devuelven las APIs (fila de la tabla products +
// imageUrl, resuelto en el service a partir de product_images).
export interface Product extends DbProduct {
  imageUrl: string | null;
}

export type Category = DbCategory;
export type Brand = DbBrand;

// El banner del hero de Inicio sigue siendo mock por ahora (no hay
// tabla de banners en uso todavía — ver el tab "Banners" oculto en el admin).
export interface Banner {
  id: string;
  title: string;
  image: string;
  link?: string;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
