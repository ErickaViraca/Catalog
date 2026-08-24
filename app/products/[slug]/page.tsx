import Link from "next/link";
import { notFound } from "next/navigation";
import { productService } from "@/src/services/productsService";
import { categoryRepository } from "@/src/repository/categoriesRepository";
import { brandRepository } from "@/src/repository/brandsRepository";
import { ProductDetailView } from "@/components/products/ProductDetailView";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await productService.getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [categoryResult, brandResult] = await Promise.all([
    categoryRepository.findById(product.categoryId),
    brandRepository.findById(product.brandId),
  ]);
  const category = categoryResult[0];
  const brand = brandResult[0];

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
        imageUrl={product.imageUrl}
        brandName={brand?.name}
        categoryName={category?.name}
      />
    </div>
  );
}
