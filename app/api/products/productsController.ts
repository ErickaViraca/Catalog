import { NextRequest, NextResponse } from "next/server";
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

    // GET /api/products
    const products = await productService.getAllProducts();
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
      featured: body.featured,
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
