import { companyRepository } from "../repository/companyRepository";
import { CompanyAddress } from "../db/schema";

export class CompanyService {
  async getCompany() {
    const result = await companyRepository.get();
    return result[0] || null;
  }

  async updateCompany(data: {
    name?: string;
    description?: string;
    dollarPriceBs?: string | number;
    phones?: string[];
    addresses?: CompanyAddress[];
    facebookUrl?: string;
    whatsappUrl?: string;
    instagramUrl?: string;
  }) {
    const existing = await this.getCompany();
    if (!existing) {
      throw new Error("No se encontró la configuración de la empresa");
    }

    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) {
      if (!data.name.trim()) {
        throw new Error("El nombre de la empresa es requerido");
      }
      updateData.name = data.name.trim();
    }

    if (data.description !== undefined) {
      const description = data.description.trim();
      const wordCount = description.length ? description.split(/\s+/).length : 0;
      if (wordCount > 50) {
        throw new Error("La descripción no puede superar las 50 palabras");
      }
      updateData.description = description;
    }

    if (data.dollarPriceBs !== undefined) {
      const price = Number(data.dollarPriceBs);
      if (isNaN(price) || price <= 0) {
        throw new Error("El valor del dólar debe ser un número mayor a 0");
      }
      updateData.dollarPriceBs = price.toFixed(2);
    }

    if (data.phones !== undefined) {
      const phones = data.phones.map((phone) => phone.trim()).filter(Boolean);
      if (phones.length === 0) {
        throw new Error("Debe haber al menos un teléfono de contacto");
      }
      updateData.phones = phones;
    }

    if (data.addresses !== undefined) {
      const addresses = data.addresses
        .map((entry) => ({
          address: entry.address?.trim() ?? "",
          mapsUrl: entry.mapsUrl?.trim() ?? "",
        }))
        .filter((entry) => entry.address);

      if (addresses.length === 0) {
        throw new Error("Debe haber al menos una dirección");
      }
      if (addresses.some((entry) => !entry.mapsUrl)) {
        throw new Error("Cada dirección debe tener un link de Google Maps");
      }
      updateData.addresses = addresses;
    }

    if (data.facebookUrl !== undefined) updateData.facebookUrl = data.facebookUrl.trim();
    if (data.whatsappUrl !== undefined) updateData.whatsappUrl = data.whatsappUrl.trim();
    if (data.instagramUrl !== undefined) updateData.instagramUrl = data.instagramUrl.trim();

    const result = await companyRepository.update(existing.id, updateData);
    return result[0] || null;
  }
}

export const companyService = new CompanyService();
