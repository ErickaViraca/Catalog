"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { mockProducts } from "@/data/mock";
import { Button } from "@/components/common/Button";
import { ProductCard } from "@/components/products/ProductCard";
import { notFound } from "next/navigation";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = mockProducts.find((p) => p.slug === params.slug);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    notFound();
  }

  const images = typeof product.images === "string"
    ? JSON.parse(product.images)
    : product.images;
  const currentImage = images[selectedImageIndex];

  const relatedProducts = mockProducts
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 3);

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-sm">
          <Link href="/" className="text-blue-600 hover:underline">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="text-blue-600 hover:underline">
            Shop
          </Link>
          <span>/</span>
          <span className="text-gray-600">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Gallery */}
          <div>
            <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden mb-4">
              <Image
                src={currentImage}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative h-20 w-20 rounded-lg overflow-hidden border-2 ${
                      idx === selectedImageIndex
                        ? "border-blue-600"
                        : "border-gray-300"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${idx}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
            <p className="text-gray-600 text-lg mb-6">{product.description}</p>

            <div className="mb-6">
              <span className="text-4xl font-bold text-blue-600">
                ${product.price.toFixed(2)}
              </span>
            </div>

            <div className="mb-6">
              <p className="text-lg font-semibold mb-2">Stock: {product.stock}</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    product.stock > 50
                      ? "bg-green-500"
                      : product.stock > 20
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                  style={{
                    width: `${Math.min((product.stock / 100) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">
                Quantity:
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                >
                  -
                </button>
                <span className="text-2xl font-bold w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  disabled={quantity === product.stock}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              size="lg"
              className="w-full mb-4"
              disabled={product.stock === 0}
              onClick={() => {
                alert(`Added ${quantity} of "${product.name}" to cart!`);
              }}
            >
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>

            {/* Additional Info */}
            <div className="border-t pt-6">
              <h3 className="font-bold text-lg mb-4">Additional Information</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex justify-between">
                  <span>Product ID:</span>
                  <span className="font-mono">{product.id}</span>
                </li>
                <li className="flex justify-between">
                  <span>Stock Status:</span>
                  <span
                    className={
                      product.stock > 0
                        ? "text-green-600 font-bold"
                        : "text-red-600 font-bold"
                    }
                  >
                    {product.stock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-8">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
