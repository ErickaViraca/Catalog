import { brandRepository } from "../repository/brandsRepository";
import { productRepository } from "../repository/productsRepository";
import { NewBrand } from "../db/schema";
import { BRAND_IN_USE_MESSAGE } from "../lib/deleteMessages";

export class BrandService {
  async getAllBrands(includeInactive = false) {
    return await brandRepository.findAll(includeInactive);
  }

  async getBrandById(id: string) {
    const result = await brandRepository.findById(id);
    return result[0] || null;
  }

  async getBrandBySlug(slug: string) {
    const result = await brandRepository.findBySlug(slug);
    return result[0] || null;
  }

  async createBrand(data: {
    name: string;
    slug: string;
    logo?: string;
    description?: string;
    active?: boolean;
  }) {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error("El nombre de la marca es requerido");
    }

    if (!data.slug || data.slug.trim().length === 0) {
      throw new Error("El slug de la marca es requerido");
    }

    const existing = await brandRepository.findBySlug(data.slug);
    if (existing.length > 0) {
      throw new Error("El slug ya existe");
    }

    const result = await brandRepository.create({
      name: data.name.trim(),
      slug: data.slug.trim().toLowerCase(),
      logo: data.logo,
      description: data.description,
      active: data.active ?? true,
    });

    return result[0] || null;
  }

  async updateBrand(
    id: string,
    data: Partial<{
      name: string;
      slug: string;
      logo: string;
      description: string;
      active: boolean;
    }>
  ) {
    const existing = await this.getBrandById(id);
    if (!existing) {
      throw new Error("Marca no encontrada");
    }

    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await brandRepository.findBySlug(data.slug);
      if (slugExists.length > 0) {
        throw new Error("El slug ya existe");
      }
    }

    const updateData: Partial<NewBrand> = {};
    if (data.name) updateData.name = data.name.trim();
    if (data.slug) updateData.slug = data.slug.trim().toLowerCase();
    if (data.logo !== undefined) updateData.logo = data.logo;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.active !== undefined) updateData.active = data.active;

    const result = await brandRepository.update(id, updateData);
    return result[0] || null;
  }

  async deleteBrand(id: string) {
    const existing = await this.getBrandById(id);
    if (!existing) {
      throw new Error("Marca no encontrada");
    }

    const relatedProducts = await productRepository.findByBrandId(id);
    if (relatedProducts.length > 0) {
      throw new Error(BRAND_IN_USE_MESSAGE);
    }

    const result = await brandRepository.delete(id);
    return result[0] || null;
  }

  async toggleBrandActive(id: string, active: boolean) {
    const existing = await this.getBrandById(id);
    if (!existing) {
      throw new Error("Marca no encontrada");
    }

    const result = await brandRepository.toggleActive(id, active);
    return result[0] || null;
  }
}

export const brandService = new BrandService();
