import { companyRepository } from "../repository/companyRepository";

export class CompanyService {
  async getCompany() {
    const result = await companyRepository.get();
    return result[0] || null;
  }

  async updateCompany(data: {
    name?: string;
    dollarPriceBs?: string | number;
    phones?: string[];
    addresses?: string[];
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
      const addresses = data.addresses.map((address) => address.trim()).filter(Boolean);
      if (addresses.length === 0) {
        throw new Error("Debe haber al menos una dirección");
      }
      updateData.addresses = addresses;
    }

    const result = await companyRepository.update(existing.id, updateData);
    return result[0] || null;
  }
}

export const companyService = new CompanyService();
