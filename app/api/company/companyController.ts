import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/src/lib/authGuard";
import { companyService } from "@/src/services/companyService";

export async function GET() {
  try {
    const company = await companyService.getCompany();

    if (!company) {
      return NextResponse.json(
        {
          success: false,
          error: "No se encontró la configuración de la empresa",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: company,
    });
  } catch (error) {
    console.error("GET /api/company error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al obtener la configuración",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();

    const company = await companyService.updateCompany({
      name: body.name,
      description: body.description,
      dollarPriceBs: body.dollarPriceBs,
      phones: body.phones,
      addresses: body.addresses,
      facebookUrl: body.facebookUrl,
      whatsappUrl: body.whatsappUrl,
      instagramUrl: body.instagramUrl,
    });

    return NextResponse.json({
      success: true,
      data: company,
      message: "Configuración actualizada exitosamente",
    });
  } catch (error) {
    console.error("PATCH /api/company error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al actualizar la configuración",
      },
      { status: 400 }
    );
  }
}
