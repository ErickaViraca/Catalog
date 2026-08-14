"use client";

import { useState } from "react";
import { buildWhatsAppLink } from "@/src/config/contact";
import { useCompany } from "@/src/hooks/useCompany";
import { Button } from "@/components/common/Button";

const SHIPPING_ZONES = [
  {
    zone: "Cochabamba (ciudad)",
    time: "24 - 48 horas hábiles",
    cost: "A coordinar según zona",
  },
  {
    zone: "Resto de Bolivia",
    time: "3 - 5 días hábiles",
    cost: "A coordinar según destino",
  },
];

export default function ShippingPage() {
  const company = useCompany();
  const [orderNumber, setOrderNumber] = useState("");

  const trackingMessage = orderNumber.trim()
    ? `Hola, quiero rastrear mi pedido #${orderNumber.trim()}`
    : "Hola, quiero rastrear mi pedido";
  const whatsappTrackingUrl = buildWhatsAppLink(company?.phones[0] ?? "", trackingMessage);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Envíos</h1>
        <p className="text-gray-600 text-lg">
          Todo lo que necesitas saber sobre nuestros envíos y cómo rastrear tu
          pedido.
        </p>
      </div>

      {/* Rastreo de pedido */}
      <div className="bg-gray-900 text-white rounded-lg p-8 mb-12">
        <h2 className="text-2xl font-bold mb-2">Rastrea tu pedido</h2>
        <p className="text-gray-400 mb-6">
          Todavía no tenemos rastreo automático — escríbenos con tu número de
          pedido y te contamos en qué va.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Número de pedido (opcional)"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
          />
          <a href={whatsappTrackingUrl} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="w-full sm:w-auto">
              Rastrear por WhatsApp
            </Button>
          </a>
        </div>
      </div>

      {/* Política de envíos */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Zonas y tiempos de entrega</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Zona</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Tiempo estimado
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Costo</th>
              </tr>
            </thead>
            <tbody>
              {SHIPPING_ZONES.map((row) => (
                <tr key={row.zone} className="border-b">
                  <td className="px-4 py-3 font-medium">{row.zone}</td>
                  <td className="px-4 py-3 text-gray-600">{row.time}</td>
                  <td className="px-4 py-3 text-gray-600">{row.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-gray-500 text-sm mt-4">
          Los tiempos y costos pueden variar según disponibilidad y destino
          exacto. Te confirmamos el detalle al coordinar tu pedido.
        </p>
      </div>
    </div>
  );
}
