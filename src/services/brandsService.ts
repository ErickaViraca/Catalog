import { brandRepository } from "../repository/brandsRepository";
import { NewBrand } from "../db/schema";

export class BrandService {
  async getAllBrands() {
    return await brandRepository.findAll();
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
  }) {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error("Brand name is required");
    }

    if (!data.slug || data.slug.trim().length === 0) {
      throw new Error("Brand slug is required");
    }

    const existing = await brandRepository.findBySlug(data.slug);
    if (existing.length > 0) {
      throw new Error("Slug already exists");
    }

    const result = await brandRepository.create({
      name: data.name.trim(),
      slug: data.slug.trim().toLowerCase(),
      logo: data.logo,
      description: data.description,
      active: true,
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
    }>
  ) {
    const existing = await this.getBrandById(id);
    if (!existing) {
      throw new Error("Brand not found");
    }

    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await brandRepository.findBySlug(data.slug);
      if (slugExists.length > 0) {
        throw new Error("Slug already exists");
      }
    }

    const updateData: Partial<NewBrand> = {};
    if (data.name) updateData.name = data.name.trim();
    if (data.slug) updateData.slug = data.slug.trim().toLowerCase();
    if (data.logo !== undefined) updateData.logo = data.logo;
    if (data.description !== undefined) updateData.description = data.description;

    const result = await brandRepository.update(id, updateData);
    return result[0] || null;
  }

  async deleteBrand(id: string) {
    const existing = await this.getBrandById(id);
    if (!existing) {
      throw new Error("Brand not found");
    }

    const result = await brandRepository.delete(id);
    return result[0] || null;
  }

  async toggleBrandActive(id: string, active: boolean) {
    const existing = await this.getBrandById(id);
    if (!existing) {
      throw new Error("Brand not found");
    }

    const result = await brandRepository.toggleActive(id, active);
    return result[0] || null;
  }
}

export const brandService = new BrandService();
