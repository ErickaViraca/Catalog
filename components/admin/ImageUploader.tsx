"use client";

import { ChangeEvent, useRef } from "react";

interface ImageUploaderProps {
  imageUrl: string;
  onUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  uploading?: boolean;
  // "create" -> "Cargar imagen" / "edit" -> "Cambiar imagen"
  mode: "create" | "edit";
  label?: string;
  // "circle" -> avatar (logos/fotos de producto) / "rectangle" -> banner ancho
  shape?: "circle" | "rectangle";
}

// Avatar circular (o rectángulo ancho, para banners) + botón de archivo
// oculto disparado por un botón real, en vez del <input type="file">
// nativo (que no se puede estilar bien).
export function ImageUploader({
  imageUrl,
  onUpload,
  onRemove,
  uploading = false,
  mode,
  label = "Imagen del Producto",
  shape = "circle",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewClass =
    shape === "rectangle"
      ? "w-40 h-24 rounded-lg object-cover border border-border shrink-0"
      : "w-14 h-14 rounded-full object-cover border border-border shrink-0";
  const placeholderClass =
    shape === "rectangle"
      ? "w-40 h-24 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 shrink-0"
      : "w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 shrink-0";

  return (
    <div>
      <h3 className="font-semibold text-sm mb-2 text-label">{label}</h3>
      <div className="flex items-center gap-4">
        {imageUrl ? (
          <img src={imageUrl} alt="Vista previa" className={previewClass} />
        ) : (
          <div className={placeholderClass}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
            </svg>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 text-sm font-semibold text-label bg-white border border-border rounded-lg shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Subiendo..." : mode === "edit" ? "Cambiar imagen" : "Cargar imagen"}
          </button>
          {imageUrl && !uploading && (
            <button
              type="button"
              onClick={onRemove}
              className="text-sm text-danger hover:underline"
            >
              Quitar
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={onUpload}
          className="hidden"
        />
      </div>
    </div>
  );
}
