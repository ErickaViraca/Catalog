import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import { ProductCard } from "@/components/products/ProductCard";
import { mockProducts, mockCategories, mockBanners } from "@/data/mock";

export default function Home() {
  const featuredProducts = mockProducts.slice(0, 6);
  const banner = mockBanners[0];

  return (
    <div className="flex flex-col">
      {/* Hero Banner */}
      <div className="relative h-96 bg-gradient-to-r from-blue-600 to-blue-800 overflow-hidden">
        {banner && (
          <Image
            src={banner.image}
            alt={banner.title}
            fill
            className="object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white z-10">
            <h1 className="text-5xl font-bold mb-4">Bienvenido a SmartCatalog</h1>
            <p className="text-xl mb-8 text-gray-100">
              Descubre los mejores accesorios tecnológicos a precios inigualables
            </p>
            <Link href="/shop">
              <Button size="lg">Comprar Ahora</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 py-16 w-full">
        <h2 className="text-3xl font-bold mb-12">Categorías Destacadas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockCategories.map((category) => (
            <Link key={category.id} href={`/shop?category=${category.slug}`}>
              <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                <div className="relative h-48 bg-gray-200">
                  {category.image && (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold">{category.name}</h3>
                  <p className="text-gray-600 text-sm mt-2">Explorar →</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-16 w-full">
        <h2 className="text-3xl font-bold mb-12">Productos Destacados</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="text-center mt-12">
          <Link href="/shop">
            <Button variant="outline" size="lg">
              Ver Todos los Productos
            </Button>
          </Link>
        </div>
      </section>

      {/* Info Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-xl font-bold mb-2">Envío Rápido</h3>
              <p className="text-gray-300">
                Envío gratis en pedidos mayores a $50
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-2">Pago Seguro</h3>
              <p className="text-gray-300">
                Transacciones 100% seguras
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">↩️</div>
              <h3 className="text-xl font-bold mb-2">Devoluciones Fáciles</h3>
              <p className="text-gray-300">
                Garantía de devolución de 30 días
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
