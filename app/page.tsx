"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import { NewProductsCarousel } from "@/components/products/NewProductsCarousel";
import { mockProducts, mockBanners } from "@/data/mock";
import { useCompany } from "@/src/hooks/useCompany";

export default function Home() {
  const company = useCompany();
  const companyName = company?.name ?? "MiTiendaXiaomi";
  const newProducts = mockProducts.slice(0, 10);
  const banner = mockBanners[0];
  const customHeroImage = company?.heroBannerUrl?.trim();
  const heroImage = customHeroImage || banner?.image;

  return (
    <div className="flex flex-col">
      {/* Hero Banner */}
      <div className="relative h-96 bg-gradient-to-r from-blue-600 to-blue-800 overflow-hidden">
        {heroImage && (
          <Image
            src={heroImage}
            alt={customHeroImage ? companyName : (banner?.title ?? companyName)}
            fill
            className="object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white z-10">
            <h1 className="text-5xl font-bold mb-4">Bienvenido a {companyName}</h1>
            <p className="text-xl mb-8 text-gray-100">
              Descubre los mejores accesorios tecnológicos a precios inigualables
            </p>
            <Link href="/shop">
              <Button size="lg">Comprar Ahora</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Productos Nuevos */}
      <section className="max-w-7xl mx-auto px-4 py-16 w-full">
        <h2 className="text-3xl font-bold mb-12">Productos Nuevos</h2>
        <NewProductsCarousel products={newProducts} />
        <div className="text-center mt-12">
          <Link href="/shop">
            <Button variant="outline" size="lg">
              Ver Todos los Productos
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
