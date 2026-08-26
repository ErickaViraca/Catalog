import { NextRequest, NextResponse } from "next/server";
import { linksService } from "@/src/services/linksService";

// GET /api/links/clicks?linkId=xxx — detalle de visitas de un link.
// Protegido por el matcher /api/links/:path* en proxy.ts (GET incluido).
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const linkId = url.searchParams.get("linkId");

    if (!linkId) {
      return NextResponse.json(
        { success: false, error: "El linkId es requerido" },
        { status: 400 }
      );
    }

    const clicks = await linksService.getClicksForLink(linkId);
    return NextResponse.json({ success: true, data: clicks, count: clicks.length });
  } catch (error) {
    console.error("GET /api/links/clicks error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al obtener los clics",
      },
      { status: 500 }
    );
  }
}
