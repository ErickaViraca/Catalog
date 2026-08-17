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
