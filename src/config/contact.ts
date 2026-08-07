// Datos de contacto, descripción y redes sociales de la tienda.
// La info real vive en data/company.json (un JSON simple no amerita
// una tabla en la DB) — este archivo solo la lee y le da forma para
// el resto de la app. Para cambiar una dirección, teléfono, email o
// red social, editar data/company.json — no hace falta tocar código.

import company from "@/data/company.json";

export const COMPANY_NAME = company.name;
export const COMPANY_DESCRIPTION = company.description;

export const CONTACT_INFO = {
  addresses: company.addresses,
  phones: company.phones,
  email: company.email,
};

const primaryPhoneDigits = company.phones[0].replace(/\D/g, "");

export const SOCIAL_LINKS = {
  facebook: company.social.facebook,
  instagram: company.social.instagram,
  // El WhatsApp se arma a partir del primer teléfono, así no hay que
  // mantener el mismo número en dos lugares distintos.
  whatsapp: `https://wa.me/${primaryPhoneDigits}`,
};
