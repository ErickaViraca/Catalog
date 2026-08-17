// Descripción, email y redes sociales de la tienda: cambian poco, así que
// siguen viviendo en data/company.json. El nombre, teléfonos y direcciones
// SÍ cambian seguido y son editables desde /adminMiTiendaSmart26 > Configuración, por eso
// viven en la tabla "companies" — ver src/hooks/useCompany.ts para leerlos.

import company from "@/data/company.json";

export const COMPANY_DESCRIPTION = company.description;

export const CONTACT_INFO = {
  email: company.email,
};

export const SOCIAL_LINKS = {
  facebook: company.social.facebook,
  instagram: company.social.instagram,
};

// El teléfono ya no es estático (viene de la tabla companies), así que el
// link de WhatsApp se arma en el momento a partir del que corresponda.
export function buildWhatsAppLink(phone: string, message?: string): string {
  const digits = phone.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
