"use client";

import Link from "next/link";
import { COMPANY_DESCRIPTION, CONTACT_INFO, SOCIAL_LINKS, buildWhatsAppLink } from "@/src/config/contact";
import { useCompany } from "@/src/hooks/useCompany";
import {
  FacebookIcon,
  InstagramIcon,
  WhatsAppIcon,
  MapPinIcon,
  PhoneIcon,
  MailIcon,
} from "@/components/common/icons";

export function Footer() {
  const company = useCompany();
  const companyName = company?.name ?? "MiTiendaXiaomi";
  const description = company?.description?.trim() || COMPANY_DESCRIPTION;
  const addresses = company?.addresses ?? [];
  const phones = company?.phones ?? [];
  const facebookUrl = company?.facebookUrl?.trim() || SOCIAL_LINKS.facebook;
  const instagramUrl = company?.instagramUrl?.trim() || SOCIAL_LINKS.instagram;
  const whatsappLink = company?.whatsappUrl?.trim() || buildWhatsAppLink(phones[0] ?? "");

  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4">{companyName}</h3>
            <p className="text-gray-400 text-sm">{description}</p>
            <div className="flex gap-3 mt-4">
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                <FacebookIcon size={18} />
              </a>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                <WhatsAppIcon size={18} />
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                <InstagramIcon size={18} />
              </a>
            </div>
          </div>

          {/* Sección "Soporte" oculta por ahora — todavía no la mostramos
              al usuario final. No borrar, solo comentada.
          <div>
            <h4 className="font-semibold mb-4">Soporte</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link href="/contact" className="hover:text-white">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-white">
                  Soporte
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-white">
                  Envíos
                </Link>
              </li>
            </ul>
          </div>
          */}

          <div>
            <h4 className="font-semibold mb-4">Contacto</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              {addresses.map((item, index) => (
                <li key={`address-${index}`} className="flex items-start gap-2">
                  <a
                    href={item.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Abrir en Maps"
                    aria-label="Abrir en Maps"
                    className="mt-0.5 shrink-0 text-gray-500 hover:text-white"
                  >
                    <MapPinIcon size={16} />
                  </a>
                  <span>{item.address}</span>
                </li>
              ))}
              {phones.map((phone, index) => (
                <li key={`phone-${index}`} className="flex items-center gap-2">
                  <a
                    href={buildWhatsAppLink(phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Escribir por WhatsApp"
                    aria-label="Escribir por WhatsApp"
                    className="text-gray-500 hover:text-white"
                  >
                    <WhatsAppIcon size={16} />
                  </a>
                  <a> {phone} </a>
                </li>
              ))}
              <li className="flex items-center gap-2">
                <MailIcon size={16} className="shrink-0 text-gray-500" />
                <a href={`mailto:${CONTACT_INFO.email}`} className="hover:text-white">
                  {CONTACT_INFO.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
          <p>
            &copy; 2026 {companyName}. Todos los derechos reservados. | Oxman Ltda
          </p>
        </div>
      </div>
    </footer>
  );
}
