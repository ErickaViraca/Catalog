import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/src/lib/authGuard";
import { categoryService } from "@/src/services/categoriesService";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (id) {
      // GET /api/categories?id=xxx
      const category = await categoryService.getCategoryById(id);

      if (!category) {
        return NextResponse.json(
          {
            success: false,
            error: "Categoría no encontrada",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: category,
      });
    }

    // GET /api/categories
    const categories = await categoryService.getAllCategories();
    return NextResponse.json({
      success: true,
      data: categories,
      count: categories.length,
    });
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al obtener las categorías",
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

    const category = await categoryService.createCategory({
      name: body.name,
      slug: body.slug,
      image: body.image,
      description: body.description,
      parentCategoryId: body.parentCategoryId,
    });

    return NextResponse.json(
      {
        success: true,
        data: category,
        message: "Categoría creada exitosamente",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/categories error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al crear la categoría",
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
          error: "El ID de la categoría es requerido",
        },
        { status: 400 }
      );
    }

    const category = await categoryService.updateCategory(id, updateData);

    return NextResponse.json({
      success: true,
      data: category,
      message: "Categoría actualizada exitosamente",
    });
  } catch (error) {
    console.error("PATCH /api/categories error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al actualizar la categoría",
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
          error: "El ID de la categoría es requerido",
        },
        { status: 400 }
      );
    }

    const category = await categoryService.deleteCategory(id);

    return NextResponse.json({
      success: true,
      data: category,
      message: "Categoría eliminada exitosamente",
    });
  } catch (error) {
    console.error("DELETE /api/categories error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al eliminar la categoría",
      },
      { status: 400 }
    );
  }
}
