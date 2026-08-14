"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { XiaomiLogo } from "@/components/common/XiaomiLogo";
import { useCompany } from "@/src/hooks/useCompany";

export function Navbar() {
  const pathname = usePathname();
  const company = useCompany();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-gray-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <XiaomiLogo size={28} />
            <span className="font-bold text-xl hidden sm:inline">
              {company?.name ?? "MiTiendaXiaomi"}
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/"
              className={`${isActive("/") ? "text-blue-400" : "hover:text-gray-300"} transition-colors`}
            >
              Inicio
            </Link>
            <Link
              href="/shop"
              className={`${isActive("/shop") ? "text-blue-400" : "hover:text-gray-300"} transition-colors`}
            >
              Catálogo
            </Link>
            <Link
              href="/admin"
              className={`${isActive("/admin") ? "text-blue-400" : "hover:text-gray-300"} transition-colors`}
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
