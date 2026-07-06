import { NextRequest, NextResponse } from "next/server";
import { brandService } from "@/src/services/brands";

export async function GET() {
  try {
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
