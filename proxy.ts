import { NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";

// Convención Next 16: proxy.ts reemplaza a middleware.ts.
// Corre antes de resolver cada ruta que matchee el matcher de abajo.
const WRITE_METHODS = ["POST", "PATCH", "PUT", "DELETE"];

export default auth((request) => {
  const isLoggedIn = !!request.auth;
  const { pathname } = request.nextUrl;

  // Páginas del admin: sin sesión -> redirect al login,
  // recordando a dónde quería ir para volver después de loguearse.
  if (pathname.startsWith("/admin") && !isLoggedIn) {
    const loginUrl = new URL("/login", request.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // APIs: los GET quedan públicos (el catálogo los necesita), pero
  // cualquier método de escritura sin sesión responde 401.
  if (
    pathname.startsWith("/api/") &&
    WRITE_METHODS.includes(request.method) &&
    !isLoggedIn
  ) {
    return NextResponse.json(
      { success: false, error: "No autorizado" },
      { status: 401 }
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/brands/:path*",
    "/api/categories/:path*",
    "/api/products/:path*",
    "/api/upload/:path*",
  ],
};
