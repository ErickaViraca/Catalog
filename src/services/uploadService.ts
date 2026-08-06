import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from "../lib/r2Client";
import { randomSlugSuffix } from "../lib/slugify";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export class UploadService {
  async uploadImage(
    file: Buffer,
    originalName: string,
    contentType: string
  ): Promise<string> {
    if (!ALLOWED_MIME_TYPES.includes(contentType)) {
      throw new Error("Tipo de archivo no permitido. Usa JPG, PNG, WEBP o AVIF");
    }

    if (file.byteLength > MAX_FILE_SIZE_BYTES) {
      throw new Error("El archivo supera el tamaño máximo permitido (5MB)");
    }

    const extension = originalName.split(".").pop()?.toLowerCase() || "jpg";
    const key = `products/${Date.now()}-${randomSlugSuffix(10)}.${extension}`;

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
