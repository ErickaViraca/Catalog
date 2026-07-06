import { NextRequest, NextResponse } from "next/server";
import { brandService } from "@/src/services/brands";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const brand = await brandService.getBrandById(params.id);

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
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch brand",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const brand = await brandService.updateBrand(params.id, {
      name: body.name,
      slug: body.slug,
      logo: body.logo,
      description: body.description,
    });

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const brand = await brandService.deleteBrand(params.id);

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
