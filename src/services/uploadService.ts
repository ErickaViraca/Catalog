import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from "../lib/r2Client";
import { randomSlugSuffix } from "../lib/slugify";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export class UploadService {
  async uploadImage(
    file: Buffer,
    originalName: string,
    contentType: string,
    folder: string = "products",
    // Código de inventario del producto: solo para reconocer a qué producto
    // pertenece cada archivo al navegar el bucket (el orden real de las
    // imágenes vive en product_images.order, no en el nombre).
    namePrefix?: string
  ): Promise<string> {
    if (!ALLOWED_MIME_TYPES.includes(contentType)) {
      throw new Error("Tipo de archivo no permitido. Usa JPG, PNG, WEBP o AVIF");
    }

    if (file.byteLength > MAX_FILE_SIZE_BYTES) {
      throw new Error("El archivo supera el tamaño máximo permitido (5MB)");
    }

    const extension = originalName.split(".").pop()?.toLowerCase() || "jpg";
    const safePrefix = namePrefix?.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 10);
    const base = safePrefix ? safePrefix : String(Date.now());
    const key = `${folder}/${base}-${randomSlugSuffix(10)}.${extension}`;

    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: file,
        ContentType: contentType,
      })
    );

    return `${R2_PUBLIC_URL}/${key}`;
  }
}

export const uploadService = new UploadService();
