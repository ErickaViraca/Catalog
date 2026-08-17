import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/src/lib/authGuard";
import { uploadService } from "@/src/services/uploadService";

// Carpetas válidas dentro del bucket de R2 — el resto del formData no se
// usa para armar la key, así que esto es la única puerta a validar.
const ALLOWED_FOLDERS = ["products", "banners"];

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folderParam = formData.get("folder");
    const folder =
      typeof folderParam === "string" && ALLOWED_FOLDERS.includes(folderParam)
        ? folderParam
        : "products";

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "No se recibió ningún archivo",
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadService.uploadImage(buffer, file.name, file.type, folder);

    return NextResponse.json({
      success: true,
      data: { url },
      message: "Imagen subida exitosamente",
    });
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al subir la imagen",
      },
      { status: 400 }
    );
  }
}
