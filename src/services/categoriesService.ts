import { categoryRepository } from "../repository/categoriesRepository";
import { NewCategory } from "../db/schema";

export class CategoryService {
  async getAllCategories() {
    return await categoryRepository.findAll();
  }

  async getCategoryById(id: string) {
    const result = await categoryRepository.findById(id);
    return result[0] || null;
  }

  async getCategoryBySlug(slug: string) {
    const result = await categoryRepository.findBySlug(slug);
    return result[0] || null;
  }

  async createCategory(data: {
    name: string;
    slug: string;
    image?: string;
    description?: string;
    parentCategoryId?: string;
  }) {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error("El nombre de la categoría es requerido");
    }

    if (!data.slug || data.slug.trim().length === 0) {
      throw new Error("El slug de la categoría es requerido");
    }

    const existing = await categoryRepository.findBySlug(data.slug);
    if (existing.length > 0) {
      throw new Error("El slug ya existe");
    }

    const result = await categoryRepository.create({
      name: data.name.trim(),
      slug: data.slug.trim().toLowerCase(),
      image: data.image,
      description: data.description,
      parentCategoryId: data.parentCategoryId,
      active: true,
    });

    return result[0] || null;
  }

  async updateCategory(
    id: string,
    data: Partial<{
      name: string;
      slug: string;
      image: string;
      description: string;
      parentCategoryId: string;
    }>
  ) {
    const existing = await this.getCategoryById(id);
    if (!existing) {
      throw new Error("Categoría no encontrada");
    }

    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await categoryRepository.findBySlug(data.slug);
      if (slugExists.length > 0) {
        throw new Error("El slug ya existe");
      }
    }

    const updateData: Partial<NewCategory> = {};
    if (data.name) updateData.name = data.name.trim();
    if (data.slug) updateData.slug = data.slug.trim().toLowerCase();
    if (data.image !== undefined) updateData.image = data.image;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.parentCategoryId !== undefined)
      updateData.parentCategoryId = data.parentCategoryId;

    const result = await categoryRepository.update(id, updateData);
    return result[0] || null;
  }

  async deleteCategory(id: string) {
    const existing = await this.getCategoryById(id);
    if (!existing) {
      throw new Error("Categoría no encontrada");
    }

    const result = await categoryRepository.delete(id);
    return result[0] || null;
  }

  async toggleCategoryActive(id: string, active: boolean) {
    const existing = await this.getCategoryById(id);
    if (!existing) {
      throw new Error("Categoría no encontrada");
    }

    const result = await categoryRepository.toggleActive(id, active);
    return result[0] || null;
  }
}

export const categoryService = new CategoryService();
