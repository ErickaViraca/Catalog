"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-gray-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold">⚡</span>
            </div>
            <span className="font-bold text-xl hidden sm:inline">SmartCatalog</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/"
              className={`${isActive("/") ? "text-blue-400" : "hover:text-gray-300"} transition-colors`}
            >
              Home
            </Link>
            <Link
              href="/shop"
              className={`${isActive("/shop") ? "text-blue-400" : "hover:text-gray-300"} transition-colors`}
            >
              Shop
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
