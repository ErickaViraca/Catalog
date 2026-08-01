import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4">MiTiendaXiaomi</h3>
            <p className="text-gray-400 text-sm">
              Tu fuente confiable de accesorios tecnológicos de calidad.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link href="/" className="hover:text-blue-400">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-blue-400">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-blue-400">
                  Admin
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Soporte</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href="#" className="hover:text-blue-400">
                  Contacto
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400">
                  Preguntas Frecuentes
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400">
                  Envíos
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Síguenos</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href="#" className="hover:text-blue-400">
                  Facebook
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400">
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
          <p>
            &copy; 2026 MiTiendaXiaomi. Todos los derechos reservados. | Hecho con Next.js
          </p>
        </div>
      </div>
    </footer>
  );
}
