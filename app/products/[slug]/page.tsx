import Link from "next/link";
import { notFound } from "next/navigation";
import { mockProducts, mockCategories, mockBrands } from "@/data/mock";
import { ProductDetailView } from "@/components/products/ProductDetailView";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = mockProducts.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  const images: string[] =
    typeof product.images === "string" ? JSON.parse(product.images) : product.images;
  const brand = mockBrands.find((b) => b.id === product.brandId);
  const category = mockCategories.find((c) => c.id === product.categoryId);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8 text-sm">
        <Link href="/" className="text-blue-600 hover:underline">
          Inicio
        </Link>
        <span className="text-gray-400">/</span>
        <Link href="/shop" className="text-blue-600 hover:underline">
          Catálogo
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600">{product.name}</span>
      </div>

      <ProductDetailView
        product={product}
        images={images}
        brandName={brand?.name}
        categoryName={category?.name}
      />
    </div>
  );
}
