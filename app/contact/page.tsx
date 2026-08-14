"use client";

import { CONTACT_INFO, buildWhatsAppLink } from "@/src/config/contact";
import { useCompany } from "@/src/hooks/useCompany";
import { MapPinIcon, PhoneIcon, MailIcon, WhatsAppIcon } from "@/components/common/icons";
import { Button } from "@/components/common/Button";

export default function ContactPage() {
  const company = useCompany();
  const addresses = company?.addresses ?? [];
  const phones = company?.phones ?? [];
  const whatsappLink = buildWhatsAppLink(phones[0] ?? "");

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Contacto</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          ¿Tienes una pregunta o necesitas ayuda? Escríbenos por cualquiera de
          estos medios y te respondemos a la brevedad.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-lg shadow p-6">
          <MapPinIcon size={24} className="text-gray-400 mb-3" />
          <h3 className="font-semibold mb-2">Nuestras tiendas</h3>
          <ul className="space-y-1 text-gray-600 text-sm">
            {addresses.map((address, index) => (
              <li key={index}>{address}</li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <PhoneIcon size={24} className="text-gray-400 mb-3" />
          <h3 className="font-semibold mb-2">Teléfonos</h3>
          <ul className="space-y-1 text-gray-600 text-sm">
            {phones.map((phone, index) => (
              <li key={index}>
                <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:text-primary">
                  {phone}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <MailIcon size={24} className="text-gray-400 mb-3" />
          <h3 className="font-semibold mb-2">Email</h3>
          <p className="text-gray-600 text-sm">
            <a href={`mailto:${CONTACT_INFO.email}`} className="hover:text-primary">
              {CONTACT_INFO.email}
            </a>
          </p>
        </div>
      </div>

      <div className="bg-gray-900 text-white rounded-lg p-8 text-center">
        <WhatsAppIcon size={32} className="mx-auto mb-4 text-gray-300" />
        <h2 className="text-2xl font-bold mb-2">¿Prefieres WhatsApp?</h2>
        <p className="text-gray-400 mb-6">
          Escríbenos directo y te respondemos lo antes posible.
        </p>
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
          <Button size="lg">Escribir por WhatsApp</Button>
        </a>
      </div>
    </div>
  );
}
