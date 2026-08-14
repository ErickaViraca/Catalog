import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { companies, NewCompany } from "../db/schema";

// Fila única (sembrada por la migración 0001) — no hay create/delete,
// solo lectura y actualización de la configuración de la empresa.
export class CompanyRepository {
  async get() {
    return db.select().from(companies).limit(1);
  }

  async update(id: string, data: Partial<NewCompany>) {
    return db
      .update(companies)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
  }
}

export const companyRepository = new CompanyRepository();
