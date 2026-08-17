"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/common/icons";
import { ProductCard } from "@/components/products/ProductCard";
import { Product } from "@/types";

interface NewProductsCarouselProps {
  products: Product[];
}

// Carrusel horizontal con scroll-snap: el item más cercano al centro del
// contenedor se agranda (efecto "coverflow"), calculado en cada scroll
// comparando el centro de cada slide contra el centro del contenedor.
export function NewProductsCarousel({ products }: NewProductsCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateFocused = () => {
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;

      let closestIndex = 0;
      let closestDistance = Infinity;
      itemRefs.current.forEach((el, idx) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const itemCenter = rect.left + rect.width / 2;
        const distance = Math.abs(itemCenter - containerCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = idx;
        }
      });
      setFocusedIndex(closestIndex);
    };

    updateFocused();
    container.addEventListener("scroll", updateFocused, { passive: true });
    return () => container.removeEventListener("scroll", updateFocused);
  }, [products.length]);

  const scrollToIndex = (index: number) => {
    const clamped = Math.max(0, Math.min(products.length - 1, index));
    itemRefs.current[clamped]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  const arrowStyles =
    "absolute top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md border border-border text-label transition-colors hover:border-primary hover:text-primary disabled:opacity-40 disabled:hover:border-border disabled:hover:text-label";

  if (products.length === 0) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => scrollToIndex(focusedIndex - 1)}
        disabled={focusedIndex === 0}
        aria-label="Producto anterior"
        className={`${arrowStyles} left-0 -translate-x-4`}
      >
        <ChevronLeftIcon size={18} />
      </button>

      <div
        ref={containerRef}
        className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-minimal py-6 px-6 sm:px-16"
      >
        {products.map((product, idx) => (
          <div
            key={product.id}
            ref={(el) => {
              itemRefs.current[idx] = el;
            }}
            className={`shrink-0 w-56 sm:w-64 snap-center transition-transform duration-300 ${
              idx === focusedIndex ? "scale-110 z-10" : "scale-90 opacity-70"
            }`}
          >
            <ProductCard product={product} hideAddToCart />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scrollToIndex(focusedIndex + 1)}
        disabled={focusedIndex === products.length - 1}
        aria-label="Siguiente producto"
        className={`${arrowStyles} right-0 translate-x-4`}
      >
        <ChevronRightIcon size={18} />
      </button>
    </div>
  );
}
