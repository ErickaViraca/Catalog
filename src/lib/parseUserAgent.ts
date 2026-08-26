// Parser mínimo de User-Agent — alcanza para segmentar el tráfico del
// tracker por dispositivo/navegador/SO sin sumar una dependencia solo
// para esto. No pretende ser exhaustivo.
export interface ParsedUserAgent {
  browser: string;
  os: string;
  deviceType: "mobile" | "tablet" | "desktop";
}

export function parseUserAgent(userAgent: string | null): ParsedUserAgent {
  const ua = userAgent || "";

  let deviceType: ParsedUserAgent["deviceType"] = "desktop";
  if (/ipad|tablet/i.test(ua)) {
    deviceType = "tablet";
  } else if (/mobile|iphone|android/i.test(ua)) {
    deviceType = "mobile";
  }

  let browser = "Otro";
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/opr\/|opera/i.test(ua)) browser = "Opera";
  else if (/chrome\//i.test(ua)) browser = "Chrome";
  else if (/firefox\//i.test(ua)) browser = "Firefox";
  else if (/safari\//i.test(ua)) browser = "Safari";

  let os = "Otro";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod|ios/i.test(ua)) os = "iOS";
  else if (/mac os x/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";

  return { browser, os, deviceType };
}
