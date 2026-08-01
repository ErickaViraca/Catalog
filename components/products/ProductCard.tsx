"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { Button } from "@/components/common/Button";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const mainImage = typeof product.images === "string"
    ? JSON.parse(product.images)[0]
    : product.images[0];

  return (
    <Link href={`/products/${product.slug}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
        <div className="relative w-full h-36 bg-gray-200">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover"
          />
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white text-sm font-bold">Agotado</span>
            </div>
          )}
        </div>

        <div className="p-3 flex-1 flex flex-col">
          <h3 className="font-bold text-sm mb-1 line-clamp-2">{product.name}</h3>
          <p className="text-gray-600 text-xs mb-2 line-clamp-1">
            {product.description}
          </p>

          <div className="mt-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-bold text-blue-600">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-xs text-gray-500">
                {product.stock} en stock
              </span>
            </div>
            <Button
              size="sm"
              className="w-full"
              variant={product.stock === 0 ? "secondary" : "primary"}
              disabled={product.stock === 0}
              onClick={() => {}}
            >
              {product.stock === 0 ? "Agotado" : "Agregar al Carrito"}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
