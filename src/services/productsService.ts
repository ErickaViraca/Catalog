import { productRepository } from "../repository/productsRepository";
import { categoryRepository } from "../repository/categoriesRepository";
import { brandRepository } from "../repository/brandsRepository";
import { productImageRepository } from "../repository/productImagesRepository";
import { companyRepository } from "../repository/companyRepository";
import { NewProduct } from "../db/schema";

export class ProductService {
  // price * companies.dollar_price_bs — companies es una fila única sembrada
  // por migración, pero por las dudas si faltara, no bloquea el guardado.
  private async computePriceBs(price: number): Promise<string> {
    const company = await companyRepository.get();
    const rate = company[0] ? Number(company[0].dollarPriceBs) : 1;
    return (price * rate).toFixed(2);
  }

  async getAllProducts(includeInactive = false) {
    const items = await productRepository.findAll(includeInactive);
    const primaryImages = await productImageRepository.findPrimaryByProductIds(
      items.map((item) => item.id)
    );
    const imageByProductId = new Map(
      primaryImages.map((image) => [image.productId, image.imageUrl])
    );

    return items.map((item) => ({
      ...item,
      imageUrl: imageByProductId.get(item.id) || null,
    }));
  }

  async getProductById(id: string) {
    const result = await productRepository.findById(id);
    const product = result[0];
    if (!product) return null;

    const primaryImages = await productImageRepository.findPrimaryByProductIds([id]);
    return { ...product, imageUrl: primaryImages[0]?.imageUrl || null };
  }

  async getProductBySlug(slug: string) {
    const result = await productRepository.findBySlug(slug);
    return result[0] || null;
  }

  async getProductsByCategory(categoryId: string) {
    return await productRepository.findByCategoryId(categoryId);
  }

  async getProductsByBrand(brandId: string) {
    return await productRepository.findByBrandId(brandId);
  }

  // Catálogo público: filtro por categorías/marcas (multi-select),
  // búsqueda por nombre de producto o de marca, y paginación.
  async getFilteredProducts(options: {
    categoryIds?: string[];
    brandIds?: string[];
    search?: string;
    sort?: "name" | "price-asc" | "price-desc";
    page?: number;
    limit?: number;
  }) {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 12;

    let searchBrandIds: string[] | undefined;
    if (options.search) {
      const matchingBrands = await brandRepository.findByNameSearch(options.search);
      searchBrandIds = matchingBrands.map((brand) => brand.id);
    }

    const { rows, total } = await productRepository.findFiltered({
      categoryIds: options.categoryIds,
      brandIds: options.brandIds,
      search: options.search,
      searchBrandIds,
      sort: options.sort,
      page,
      limit,
    });

    const primaryImages = await productImageRepository.findPrimaryByProductIds(
      rows.map((row) => row.id)
    );
    const imageByProductId = new Map(
      primaryImages.map((image) => [image.productId, image.imageUrl])
    );

    return {
      items: rows.map((row) => ({
        ...row,
        imageUrl: imageByProductId.get(row.id) || null,
      })),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async createProduct(data: {
    name: string;
    code?: string;
    slug: string;
    description: string;
    price: string | number;
    priceBs?: string | number;
    stock?: number;
    sku: string;
    categoryId: string;
    brandId: string;
    active?: boolean;
    featured?: boolean;
    isNew?: boolean;
    imageUrl?: string;
  }) {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error("El nombre del producto es requerido");
    }

    if (data.code && data.code.trim().length > 0) {
      if (data.code.trim().length > 50) {
        throw new Error("El código de fabricante no puede superar los 50 caracteres");
      }

      if (!/^[a-zA-Z0-9-]+$/.test(data.code.trim())) {
        throw new Error("El código de fabricante solo puede tener letras, números y guiones");
      }
    }

    if (!data.slug || data.slug.trim().length === 0) {
      throw new Error("El slug del producto es requerido");
    }

    if (!data.description || data.description.trim().length === 0) {
      throw new Error("La descripción del producto es requerida");
    }

    const price = Number(data.price);
    if (!data.price || isNaN(price) || price < 0) {
      throw new Error("El precio debe ser un número válido mayor o igual a 0");
    }

    let priceBs: number | undefined;
    if (data.priceBs !== undefined) {
      priceBs = Number(data.priceBs);
      if (isNaN(priceBs) || priceBs < 0) {
        throw new Error("El precio en Bs debe ser un número válido mayor o igual a 0");
      }
    }

    if (!data.sku || data.sku.trim().length === 0) {
      throw new Error("El código de inventario es requerido");
    }

    if (data.sku.trim().length > 10) {
      throw new Error("El código de inventario no puede superar los 10 caracteres");
    }

    if (!data.categoryId) {
      throw new Error("La categoría del producto es requerida");
    }

    if (!data.brandId) {
      throw new Error("La marca del producto es requerida");
    }

    const existingSlug = await productRepository.findBySlug(data.slug);
    if (existingSlug.length > 0) {
      throw new Error("El slug ya existe");
    }

    const existingSku = await productRepository.findBySku(data.sku);
    if (existingSku.length > 0) {
      throw new Error("Ese código de inventario ya está en uso");
    }

    const category = await categoryRepository.findById(data.categoryId);
    if (category.length === 0) {
      throw new Error("La categoría seleccionada no existe");
    }

    const brand = await brandRepository.findById(data.brandId);
    if (brand.length === 0) {
      throw new Error("La marca seleccionada no existe");
    }

    const result = await productRepository.create({
      name: data.name.trim(),
      code: data.code?.trim() || null,
      slug: data.slug.trim().toLowerCase(),
      description: data.description.trim(),
      price: price.toFixed(2),
      priceBs: priceBs !== undefined ? priceBs.toFixed(2) : await this.computePriceBs(price),
      stock: data.stock ?? 0,
      sku: data.sku.trim(),
      categoryId: data.categoryId,
      brandId: data.brandId,
      active: data.active ?? true,
      featured: data.featured ?? false,
      isNew: data.isNew ?? true,
    });

    const product = result[0];
    if (!product) return null;

    if (data.imageUrl) {
      await productImageRepository.create({
        productId: product.id,
        imageUrl: data.imageUrl,
        isPrimary: true,
        order: 0,
      });
    }

    return { ...product, imageUrl: data.imageUrl || null };
  }

  async updateProduct(
    id: string,
    data: Partial<{
      name: string;
      code: string;
      slug: string;
      description: string;
      price: string | number;
      priceBs: string | number;
      stock: number;
      sku: string;
      categoryId: string;
      brandId: string;
      active: boolean;
      featured: boolean;
      isNew: boolean;
      imageUrl: string;
    }>
  ) {
    const existing = await this.getProductById(id);
    if (!existing) {
      throw new Error("Producto no encontrado");
    }

    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await productRepository.findBySlug(data.slug);
      if (slugExists.length > 0) {
        throw new Error("El slug ya existe");
      }
    }

    if (data.sku && data.sku !== existing.sku) {
      if (data.sku.trim().length > 10) {
        throw new Error("El código de inventario no puede superar los 10 caracteres");
      }
      const skuExists = await productRepository.findBySku(data.sku);
      if (skuExists.length > 0) {
        throw new Error("Ese código de inventario ya está en uso");
      }
    }

    if (data.categoryId) {
      const category = await categoryRepository.findById(data.categoryId);
      if (category.length === 0) {
        throw new Error("La categoría seleccionada no existe");
      }
    }

    if (data.brandId) {
      const brand = await brandRepository.findById(data.brandId);
      if (brand.length === 0) {
        throw new Error("La marca seleccionada no existe");
      }
    }

    if (data.code) {
      if (data.code.trim().length > 50) {
        throw new Error("El código de fabricante no puede superar los 50 caracteres");
      }
      if (!/^[a-zA-Z0-9-]+$/.test(data.code.trim())) {
        throw new Error("El código de fabricante solo puede tener letras, números y guiones");
      }
    }

    const updateData: Partial<NewProduct> = {};
    if (data.name) updateData.name = data.name.trim();
    if (data.code) updateData.code = data.code.trim();
    if (data.slug) updateData.slug = data.slug.trim().toLowerCase();
    if (data.description) updateData.description = data.description.trim();
    if (data.price !== undefined) {
      const price = Number(data.price);
      if (isNaN(price) || price < 0) {
        throw new Error("El precio debe ser un número válido mayor o igual a 0");
      }
      updateData.price = price.toFixed(2);
    }
    if (data.priceBs !== undefined) {
      const priceBs = Number(data.priceBs);
      if (isNaN(priceBs) || priceBs < 0) {
        throw new Error("El precio en Bs debe ser un número válido mayor o igual a 0");
      }
      updateData.priceBs = priceBs.toFixed(2);
    } else if (updateData.price !== undefined) {
      // El usuario cambió el precio en USD sin tocar el de Bs: recalcular.
      updateData.priceBs = await this.computePriceBs(Number(updateData.price));
    }
    if (data.stock !== undefined) updateData.stock = data.stock;
    if (data.sku) updateData.sku = data.sku.trim();
    if (data.categoryId) updateData.categoryId = data.categoryId;
    if (data.brandId) updateData.brandId = data.brandId;
    if (data.active !== undefined) updateData.active = data.active;
    if (data.featured !== undefined) updateData.featured = data.featured;
    if (data.isNew !== undefined) updateData.isNew = data.isNew;

    const result = await productRepository.update(id, updateData);
    const product = result[0];
    if (!product) return null;

    let imageUrl = existing.imageUrl;
    if (data.imageUrl !== undefined) {
      await productImageRepository.deleteByProductId(id);
      if (data.imageUrl) {
        await productImageRepository.create({
          productId: id,
          imageUrl: data.imageUrl,
          isPrimary: true,
          order: 0,
        });
        imageUrl = data.imageUrl;
      } else {
        imageUrl = null;
      }
    }

    return { ...product, imageUrl };
  }

  async deleteProduct(id: string) {
    const existing = await this.getProductById(id);
    if (!existing) {
      throw new Error("Producto no encontrado");
    }

    await productImageRepository.deleteByProductId(id);
    const result = await productRepository.delete(id);
    return result[0] || null;
  }

  async toggleProductActive(id: string, active: boolean) {
    const existing = await this.getProductById(id);
    if (!existing) {
      throw new Error("Producto no encontrado");
    }

    const result = await productRepository.toggleActive(id, active);
    return result[0] || null;
  }

  async toggleProductFeatured(id: string, featured: boolean) {
    const existing = await this.getProductById(id);
    if (!existing) {
      throw new Error("Producto no encontrado");
    }

    const result = await productRepository.toggleFeatured(id, featured);
    return result[0] || null;
  }
}

export const productService = new ProductService();
