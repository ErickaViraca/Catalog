import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/src/lib/authGuard";
import { linksService } from "@/src/services/linksService";

// Todo /api/links requiere sesión (ver proxy.ts) — a diferencia del
// catálogo público, esta data (clics, IPs aproximadas) no es para mostrar
// afuera.
export async function GET() {
  try {
    const links = await linksService.getAllLinks();
    return NextResponse.json({ success: true, data: links, count: links.length });
  } catch (error) {
    console.error("GET /api/links error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al obtener los links",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const link = await linksService.createLink({
      slug: body.slug,
      destinationUrl: body.destinationUrl,
      label: body.label,
    });

    return NextResponse.json(
      { success: true, data: link, message: "Link creado exitosamente" },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/links error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al crear el link",
      },
      { status: 400 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "El ID del link es requerido" },
        { status: 400 }
      );
    }

    const link = await linksService.updateLink(id, updateData);
    return NextResponse.json({
      success: true,
      data: link,
      message: "Link actualizado exitosamente",
    });
  } catch (error) {
    console.error("PATCH /api/links error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al actualizar el link",
      },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "El ID del link es requerido" },
        { status: 400 }
      );
    }

    const link = await linksService.deleteLink(id);
    return NextResponse.json({
      success: true,
      data: link,
      message: "Link eliminado exitosamente",
    });
  } catch (error) {
    console.error("DELETE /api/links error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al eliminar el link",
      },
      { status: 400 }
    );
  }
}
