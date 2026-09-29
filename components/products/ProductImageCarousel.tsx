"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ImagePlaceholder } from "@/components/common/ImagePlaceholder";

interface ProductImageCarouselProps {
  imageUrls: string[];
  alt: string;
  // Se posiciona sobre el contenedor padre (que define el tamaño).
  className?: string;
  // Versión para cards del catálogo: sin flechas, puntitos chicos que solo
  // indican posición (la card entera es un link) y sin prioridad de carga.
  compact?: boolean;
}

const ARROW_BASE =
  "hidden md:flex absolute top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white/90 text-label shadow-md border border-border transition-opacity duration-200 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:bg-white";

// Galería de imágenes de producto: arrastre con el dedo/mouse (Embla) y, en
// el detalle, flechas que aparecen al pasar el mouse por la imagen.
export function ProductImageCarousel({
  imageUrls,
  alt,
  className = "",
  compact = false,
}: ProductImageCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start" });
  const [selected, setSelected] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const sync = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    sync();
    emblaApi.on("select", sync).on("reInit", sync);
    return () => {
      emblaApi.off("select", sync).off("reInit", sync);
    };
  }, [emblaApi, sync]);

  if (imageUrls.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <ImagePlaceholder size={compact ? 48 : 64} />
      </div>
    );
  }

  const hasMany = imageUrls.length > 1;

  return (
    <div className={`group ${className}`}>
      <div ref={emblaRef} className="overflow-hidden h-full">
        <div className="flex h-full">
          {imageUrls.map((url, index) => (
            <div key={url} className="relative flex-[0_0_100%] min-w-0 h-full">
              {/* Solo se descarga la imagen actual y sus vecinas: con las
                  imágenes sin optimizar, cargar las 10 de cada producto pesa
                  demasiado (sobre todo en el catálogo, con 12 cards). */}
              {Math.abs(index - selected) <= 1 && (
                <Image
                  src={url}
                  alt={hasMany ? `${alt} (${index + 1} de ${imageUrls.length})` : alt}
                  fill
                  sizes={
                    compact
                      ? "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                      : "(min-width: 1024px) 50vw, 100vw"
                  }
                  priority={!compact && index === 0}
                  draggable={false}
                  className="object-cover select-none"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {hasMany && !compact && (
        <>
          {canPrev && (
            <button
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              aria-label="Imagen anterior"
              className={`${ARROW_BASE} left-3`}
            >
              ‹
            </button>
          )}
          {canNext && (
            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              aria-label="Imagen siguiente"
              className={`${ARROW_BASE} right-3`}
            >
              ›
            </button>
          )}
        </>
      )}

      {hasMany && (
        <div
          className={`absolute left-0 right-0 z-10 flex justify-center pointer-events-none ${
            compact ? "bottom-2 gap-1" : "bottom-3 gap-1.5"
          }`}
        >
          {imageUrls.map((url, index) =>
            compact ? (
              <span
                key={url}
                data-dot
                data-active={index === selected}
                className={`h-1.5 rounded-full shadow transition-all ${
                  index === selected ? "w-3 bg-white" : "w-1.5 bg-white/60"
                }`}
              />
            ) : (
              <button
                key={url}
                type="button"
                onClick={() => emblaApi?.scrollTo(index)}
                aria-label={`Ir a la imagen ${index + 1}`}
                className={`pointer-events-auto h-2 rounded-full transition-all ${
                  index === selected ? "w-5 bg-white" : "w-2 bg-white/60 hover:bg-white/80"
                } shadow`}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
