import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/src/lib/authGuard";
import { brandService } from "@/src/services/brandsService";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (id) {
      // GET /api/brands?id=xxx
      const brand = await brandService.getBrandById(id);

      if (!brand) {
        return NextResponse.json(
          {
            success: false,
            error: "Marca no encontrada",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: brand,
      });
    }

    // GET /api/brands
    const brands = await brandService.getAllBrands();
    return NextResponse.json({
      success: true,
      data: brands,
      count: brands.length,
    });
  } catch (error) {
    console.error("GET /api/brands error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al obtener las marcas",
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

    const brand = await brandService.createBrand({
      name: body.name,
      slug: body.slug,
      logo: body.logo,
      description: body.description,
    });

    return NextResponse.json(
      {
        success: true,
        data: brand,
        message: "Marca creada exitosamente",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/brands error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al crear la marca",
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
        {
          success: false,
          error: "El ID de la marca es requerido",
        },
        { status: 400 }
      );
    }

    const brand = await brandService.updateBrand(id, updateData);

    return NextResponse.json({
      success: true,
      data: brand,
      message: "Marca actualizada exitosamente",
    });
  } catch (error) {
    console.error("PATCH /api/brands error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al actualizar la marca",
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
        {
          success: false,
          error: "El ID de la marca es requerido",
        },
        { status: 400 }
      );
    }

    const brand = await brandService.deleteBrand(id);

    return NextResponse.json({
      success: true,
      data: brand,
      message: "Marca eliminada exitosamente",
    });
  } catch (error) {
    console.error("DELETE /api/brands error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al eliminar la marca",
      },
      { status: 400 }
    );
  }
}
