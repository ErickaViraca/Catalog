"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/common/icons";
import { ProductCard } from "@/components/products/ProductCard";
import { Product } from "@/types";

interface NewProductsCarouselProps {
  products: Product[];
}

const AUTOPLAY_DELAY_MS = 4000;

// Carrusel de "Productos Nuevos" con Embla: avanza solo, se puede arrastrar
// con dedo/mouse y la card centrada se agranda (efecto "coverflow"). Las
// fotos de la card centrada se deslizan por su cuenta (galería anidada).
export function NewProductsCarousel({ products }: NewProductsCarouselProps) {
  const autoplay = useMemo(
    () =>
      Autoplay({
        delay: AUTOPLAY_DELAY_MS,
        stopOnInteraction: false, // retoma solo después de tocar/arrastrar
        stopOnMouseEnter: true, // pausa mientras el mouse está encima
      }),
    []
  );

  // Memoizadas: si las opciones cambian de identidad en cada render, Embla
  // se reinicializa constantemente.
  const options = useMemo(
    () => ({
      loop: true,
      align: "center" as const,
      // Los gestos que empiezan sobre las fotos de la card centrada los
      // maneja la galería de esa card, no este carrusel.
      watchDrag: (_api: unknown, evt: Event) =>
        !(evt.target as Element | null)?.closest?.("[data-nested-carousel]"),
    }),
    []
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(options, [autoplay]);
  const [selected, setSelected] = useState(0);

  const sync = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    sync();
    emblaApi.on("select", sync).on("reInit", sync);
    return () => {
      emblaApi.off("select", sync).off("reInit", sync);
    };
  }, [emblaApi, sync]);

  // Quien pidió "reducir movimiento" en su sistema no recibe avance solo.
  useEffect(() => {
    if (!emblaApi) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      autoplay.stop();
    }
  }, [emblaApi, autoplay]);

  const arrowStyles =
    "absolute top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md border border-border text-label transition-colors hover:border-primary hover:text-primary";

  if (products.length === 0) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => emblaApi?.scrollPrev()}
        aria-label="Producto anterior"
        className={`${arrowStyles} left-0 -translate-x-4`}
      >
        <ChevronLeftIcon size={18} />
      </button>

      {/* touch-action en el contenedor externo (el que tiene el padding): si
          solo está en el interno, un gesto que empieza en el relleno lo
          cancela el navegador y el carrusel no lo recibe. */}
      <div ref={emblaRef} className="overflow-hidden py-8 touch-pan-y touch-pinch-zoom">
        <div className="flex">
          {products.map((product, idx) => (
            <div
              key={product.id}
              className={`flex-none w-56 sm:w-64 mr-6 transition-transform duration-300 ${
                idx === selected ? "scale-110 z-10" : "scale-90 opacity-70"
              }`}
            >
              <ProductCard product={product} hideAddToCart swipeImages={idx === selected} />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => emblaApi?.scrollNext()}
        aria-label="Siguiente producto"
        className={`${arrowStyles} right-0 translate-x-4`}
      >
        <ChevronRightIcon size={18} />
      </button>
    </div>
  );
}
