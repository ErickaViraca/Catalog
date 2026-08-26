import { NextRequest, NextResponse } from "next/server";
import { linksService } from "@/src/services/linksService";

// Ruta pública (no pasa por proxy.ts, ver matcher) — es el link que se
// comparte en redes. Registra el clic (IP -> geo aproximada, user agent,
// referrer, hora) y redirige a la URL destino real.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const destinationUrl = await linksService.trackAndResolve(slug, request);

  if (!destinationUrl) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.redirect(destinationUrl);
}
