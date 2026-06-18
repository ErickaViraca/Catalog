export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  images: string;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

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
