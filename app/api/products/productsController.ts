import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { requireAuth } from "@/src/lib/authGuard";
import { productService } from "@/src/services/productsService";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const categoryId = url.searchParams.get("categoryId");
    const brandId = url.searchParams.get("brandId");

    if (id) {
      // GET /api/products?id=xxx
      const product = await productService.getProductById(id);

      if (!product) {
        return NextResponse.json(
          {
            success: false,
            error: "Producto no encontrado",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: product,
      });
    }

    if (categoryId) {
      // GET /api/products?categoryId=xxx
      const products = await productService.getProductsByCategory(categoryId);
      return NextResponse.json({
        success: true,
        data: products,
        count: products.length,
      });
    }

    if (brandId) {
      // GET /api/products?brandId=xxx
      const products = await productService.getProductsByBrand(brandId);
      return NextResponse.json({
        success: true,
        data: products,
        count: products.length,
      });
    }

    const categoryIdsParam = url.searchParams.get("categoryIds");
    const brandIdsParam = url.searchParams.get("brandIds");
    const search = url.searchParams.get("search");
    const page = url.searchParams.get("page");
    const sort = url.searchParams.get("sort");

    // Catálogo público (/shop): filtros + paginación. Sin estos params,
    // se mantiene el comportamiento anterior (todos los productos) —
    // el admin panel sigue dependiendo de eso para listar sin recortar.
    if (categoryIdsParam || brandIdsParam || search || page || sort) {
      const result = await productService.getFilteredProducts({
        categoryIds: categoryIdsParam ? categoryIdsParam.split(",").filter(Boolean) : undefined,
        brandIds: brandIdsParam ? brandIdsParam.split(",").filter(Boolean) : undefined,
        search: search || undefined,
        sort: (sort as "name" | "price-asc" | "price-desc" | null) || undefined,
        page: page ? Number(page) : undefined,
      });

      return NextResponse.json({
        success: true,
        data: result.items,
        count: result.total,
        page: result.page,
        totalPages: result.totalPages,
      });
    }

    // GET /api/products (?includeInactive=true solo tiene efecto si hay sesión)
    let includeInactive = false;
    if (url.searchParams.get("includeInactive") === "true") {
      const session = await auth();
      includeInactive = !!session?.user;
    }

    const products = await productService.getAllProducts(includeInactive);
    return NextResponse.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al obtener los productos",
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

    const product = await productService.createProduct({
      name: body.name,
      code: body.code,
      slug: body.slug,
      description: body.description,
      price: body.price,
      stock: body.stock,
      sku: body.sku,
      categoryId: body.categoryId,
      brandId: body.brandId,
      active: body.active,
      featured: body.featured,
      isNew: body.isNew,
      imageUrl: body.imageUrl,
    });

    return NextResponse.json(
      {
        success: true,
        data: product,
        message: "Producto creado exitosamente",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al crear el producto",
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
          error: "El ID del producto es requerido",
        },
        { status: 400 }
      );
    }

    const product = await productService.updateProduct(id, updateData);

    return NextResponse.json({
      success: true,
      data: product,
      message: "Producto actualizado exitosamente",
    });
  } catch (error) {
    console.error("PATCH /api/products error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al actualizar el producto",
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
          error: "El ID del producto es requerido",
        },
        { status: 400 }
      );
    }

    const product = await productService.deleteProduct(id);

    return NextResponse.json({
      success: true,
      data: product,
      message: "Producto eliminado exitosamente",
    });
  } catch (error) {
    console.error("DELETE /api/products error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al eliminar el producto",
      },
      { status: 400 }
    );
  }
}
