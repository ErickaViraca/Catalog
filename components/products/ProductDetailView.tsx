"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePlaceholder } from "@/components/common/ImagePlaceholder";

type Tab = "description" | "specs";

interface ProductDetailViewProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
  };
  images: string[];
  brandName?: string;
  categoryName?: string;
}

export function ProductDetailView({
  product,
  images,
  brandName,
  categoryName,
}: ProductDetailViewProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>("description");

  const currentImage = images[selectedImageIndex];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* Gallery */}
      <div>
        <div className="relative w-full h-96 lg:h-[28rem] bg-gray-200 rounded-lg overflow-hidden mb-4">
          {currentImage ? (
            <Image
              src={currentImage}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImagePlaceholder size={64} />
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white text-lg font-bold">Agotado</span>
            </div>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex gap-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative h-20 w-20 rounded-lg overflow-hidden border-2 transition-colors ${
                  idx === selectedImageIndex
                    ? "border-blue-600"
                    : "border-gray-300"
                }`}
              >
                <Image
                  src={img}
                  alt={`${product.name} ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        {(brandName || categoryName) && (
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide mb-2">
            {brandName && <span className="text-blue-600">{brandName}</span>}
            {categoryName && <span className="text-gray-500">{categoryName}</span>}
          </div>
        )}

        <h1 className="text-3xl md:text-4xl font-bold mb-6">{product.name}</h1>

        <div className="bg-gray-100 rounded-lg p-4 mb-8 inline-block">
          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
            Precio
          </p>
          <p className="text-3xl font-bold text-blue-600">
            ${product.price.toFixed(2)}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b mb-4">
          <button
            onClick={() => setActiveTab("description")}
            className={`pb-2 font-semibold border-b-2 transition-colors ${
              activeTab === "description"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            Descripción
          </button>
          <button
            onClick={() => setActiveTab("specs")}
            className={`pb-2 font-semibold border-b-2 transition-colors ${
              activeTab === "specs"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            Especificaciones
          </button>
        </div>

        {activeTab === "description" ? (
          <p className="text-gray-600 leading-relaxed">
            {product.description || "Este producto no tiene una descripción detallada todavía."}
          </p>
        ) : (
          <ul className="space-y-3 text-gray-600">
            {brandName && (
              <li className="flex justify-between border-b pb-2">
                <span>Marca</span>
                <span className="font-semibold text-gray-900">{brandName}</span>
              </li>
            )}
            {categoryName && (
              <li className="flex justify-between border-b pb-2">
                <span>Categoría</span>
                <span className="font-semibold text-gray-900">{categoryName}</span>
              </li>
            )}
            <li className="flex justify-between border-b pb-2">
              <span>Disponibilidad</span>
              <span
                className={`font-semibold ${
                  product.stock > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {product.stock > 0 ? `${product.stock} unidades` : "Agotado"}
              </span>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
