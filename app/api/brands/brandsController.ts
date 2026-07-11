import { NextRequest, NextResponse } from "next/server";
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
            error: "Brand not found",
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
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch brands",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
        message: "Brand created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create brand",
      },
      { status: 400 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Brand ID is required",
        },
        { status: 400 }
      );
    }

    const brand = await brandService.updateBrand(id, updateData);

    return NextResponse.json({
      success: true,
      data: brand,
      message: "Brand updated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update brand",
      },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Brand ID is required",
        },
        { status: 400 }
      );
    }

    const brand = await brandService.deleteBrand(id);

    return NextResponse.json({
      success: true,
      data: brand,
      message: "Brand deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete brand",
      },
      { status: 400 }
    );
  }
}
