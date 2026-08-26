import { linksRepository } from "../repository/linksRepository";
import { NewTrackedLink } from "../db/schema";
import { getClientIp, isPrivateIp } from "../lib/getClientIp";
import { parseUserAgent } from "../lib/parseUserAgent";

interface GeoInfo {
  city: string | null;
  region: string | null;
  country: string | null;
  countryCode: string | null;
  latitude: number | null;
  longitude: number | null;
}

const EMPTY_GEO: GeoInfo = {
  city: null,
  region: null,
  country: null,
  countryCode: null,
  latitude: null,
  longitude: null,
};

// ip-api.com: gratis, sin API key, ~45 req/min por IP de origen — de sobra
// para el volumen de clics que va a recibir un link compartido en redes.
// Si falla o se agota la cuota, el clic igual se guarda (solo sin geo).
async function lookupGeo(ip: string): Promise<GeoInfo> {
  if (isPrivateIp(ip)) return EMPTY_GEO;

  try {
    const response = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,city,regionName,country,countryCode,lat,lon`,
      { signal: AbortSignal.timeout(3000) }
    );
    if (!response.ok) return EMPTY_GEO;

    const data = await response.json();
    if (data.status !== "success") return EMPTY_GEO;

    return {
      city: data.city || null,
      region: data.regionName || null,
      country: data.country || null,
      countryCode: data.countryCode || null,
      latitude: typeof data.lat === "number" ? data.lat : null,
      longitude: typeof data.lon === "number" ? data.lon : null,
    };
  } catch (error) {
    console.error("lookupGeo error:", error);
    return EMPTY_GEO;
  }
}

export class LinksService {
  async getAllLinks() {
    return linksRepository.findAllLinks();
  }

  async getLinkBySlug(slug: string) {
    const result = await linksRepository.findLinkBySlug(slug);
    return result[0] || null;
  }

  async createLink(data: { slug: string; destinationUrl: string; label: string }) {
    if (!data.slug || data.slug.trim().length === 0) {
      throw new Error("El slug es requerido");
    }
    if (!data.destinationUrl || data.destinationUrl.trim().length === 0) {
      throw new Error("La URL de destino es requerida");
    }
    if (!data.label || data.label.trim().length === 0) {
      throw new Error("El nombre interno es requerido");
    }

    try {
      new URL(data.destinationUrl);
    } catch {
      throw new Error("La URL de destino no es válida");
    }

    const existing = await linksRepository.findLinkBySlug(data.slug);
    if (existing.length > 0) {
      throw new Error("Ese slug ya está en uso");
    }

    const result = await linksRepository.createLink({
      slug: data.slug.trim().toLowerCase(),
      destinationUrl: data.destinationUrl.trim(),
      label: data.label.trim(),
    });
    return result[0] || null;
  }

  async updateLink(id: string, data: Partial<Pick<NewTrackedLink, "active" | "label">>) {
    const result = await linksRepository.updateLink(id, data);
    return result[0] || null;
  }

  async deleteLink(id: string) {
    const result = await linksRepository.deleteLink(id);
    return result[0] || null;
  }

  async getClicksForLink(linkId: string) {
    return linksRepository.findClicksByLinkId(linkId);
  }

  // Registra la visita y devuelve la URL de destino (o null si el link no
  // existe/está inactivo) — usado por el handler de redirect en /r/[slug].
  async trackAndResolve(slug: string, request: Request): Promise<string | null> {
    const link = await this.getLinkBySlug(slug);
    if (!link || !link.active) return null;

    const ip = getClientIp(request);
    const geo = ip ? await lookupGeo(ip) : EMPTY_GEO;
    const userAgent = request.headers.get("user-agent");
    const { browser, os, deviceType } = parseUserAgent(userAgent);

    await linksRepository.recordClick({
      linkId: link.id,
      ipAddress: ip,
      city: geo.city,
      region: geo.region,
      country: geo.country,
      countryCode: geo.countryCode,
      latitude: geo.latitude?.toString(),
      longitude: geo.longitude?.toString(),
      userAgent,
      browser,
      os,
      deviceType,
      referrer: request.headers.get("referer"),
    });

    return link.destinationUrl;
  }
}

export const linksService = new LinksService();
