// Detrás de Vercel (y de la mayoría de proxies), la IP real del visitante
// viaja en x-forwarded-for como el primer valor de la lista (el resto son
// proxies intermedios). x-real-ip es el fallback de otros proveedores.
export function getClientIp(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return null;
}

// IPs privadas/locales (dev, red interna) no tienen geolocalización real —
// consultarlas a la API externa solo desperdicia el cupo gratuito.
export function isPrivateIp(ip: string): boolean {
  if (ip === "::1" || ip === "127.0.0.1") return true;
  if (/^10\./.test(ip)) return true;
  if (/^192\.168\./.test(ip)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)) return true;
  return false;
}
