"use client";

import { useEffect, useState } from "react";

export interface CompanyAddress {
  address: string;
  mapsUrl: string;
}

export interface CompanyData {
  id: string;
  name: string;
  description: string;
  dollarPriceBs: string;
  phones: string[];
  addresses: CompanyAddress[];
}

// Datos de empresa editables desde /admin > Configuración (nombre, cotización
// del dólar, teléfonos, direcciones). null mientras carga o si falla el fetch
// — cada consumidor decide su propio fallback para ese caso.
export function useCompany() {
  const [company, setCompany] = useState<CompanyData | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/company")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.success) {
          setCompany(data.data);
        }
      })
      .catch((err) => console.error("Error al obtener datos de la empresa", err));

    return () => {
      cancelled = true;
    };
  }, []);

  return company;
}
