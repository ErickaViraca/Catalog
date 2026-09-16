import type { NextConfig } from "next";

// El hostname de R2 depende de la cuenta (pub-xxxx.r2.dev o dominio propio),
// así que se resuelve en runtime desde R2_PUBLIC_URL en vez de hardcodearlo.
const r2Hostname = (() => {
  try {
    return process.env.R2_PUBLIC_URL ? new URL(process.env.R2_PUBLIC_URL).hostname : undefined;
  } catch {
    return undefined;
  }
})();

const nextConfig: NextConfig = {
  images: {
    // Vercel factura la optimización de imágenes por "source image" distinta
    // procesada en el mes — con el catálogo creciendo esto se agota rápido
    // (pasó recién: OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED). Como las
    // imágenes ya se sirven desde un dominio propio de R2 (sin el rate limit
    // del subdominio de pruebas), servirlas sin optimizar es más confiable
    // que depender de esa cuota.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      ...(r2Hostname
        ? [{ protocol: "https" as const, hostname: r2Hostname }]
        : []),
    ],
  },
};

export default nextConfig;
