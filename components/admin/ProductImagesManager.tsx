"use client";

import { ChangeEvent, useRef, useState } from "react";
import { useToast } from "@/components/common/ToastProvider";

export const MAX_PRODUCT_IMAGES = 10;

interface ProductImagesManagerProps {
  // Orden = orden del carrusel; la primera es la imagen principal del producto.
  imageUrls: string[];
  onChange: (imageUrls: string[]) => void;
  // Código de inventario: prefijo del nombre del archivo en R2.
  sku: string;
  onUploadingChange?: (uploading: boolean) => void;
}

const ICON_BUTTON =
  "w-6 h-6 flex items-center justify-center rounded-full bg-white/90 text-label shadow border border-border text-xs hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed";

export function ProductImagesManager({
  imageUrls,
  onChange,
  sku,
  onUploadingChange,
}: ProductImagesManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { showError } = useToast();

  const remaining = MAX_PRODUCT_IMAGES - imageUrls.length;

  const setUploadingState = (value: boolean) => {
    setUploading(value);
    onUploadingChange?.(value);
  };

  const handleFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    if (files.length > remaining) {
      showError(
        `Solo caben ${remaining} imagen(es) más (máximo ${MAX_PRODUCT_IMAGES} por producto)`
      );
    }

    setUploadingState(true);
    let current = imageUrls;
    try {
      for (const file of files.slice(0, remaining)) {
        const formData = new FormData();
        formData.append("file", file);
        if (sku.trim()) formData.append("sku", sku.trim());

        const response = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await response.json();
        if (!data.success) {
          showError(data.error || "Error al subir la imagen");
          continue;
        }
        current = [...current, data.data.url];
        onChange(current);
      }
    } catch (err) {
      showError("Error al subir la imagen");
      console.error(err);
    } finally {
      setUploadingState(false);
    }
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= imageUrls.length) return;
    const next = [...imageUrls];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(imageUrls.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="font-semibold text-sm text-label">Imágenes del Producto</h3>
        <span className="text-xs text-gray-500">
          {imageUrls.length}/{MAX_PRODUCT_IMAGES} · la primera es la principal
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        {imageUrls.map((url, index) => (
          <div
            key={url}
            className="relative w-28 h-28 rounded-lg overflow-hidden border border-border bg-gray-100"
          >
            <img src={url} alt={`Imagen ${index + 1}`} className="w-full h-full object-cover" />

            {index === 0 && (
              <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[10px] font-semibold">
                Principal
              </span>
            )}

            <button
              type="button"
              onClick={() => remove(index)}
              disabled={uploading}
              aria-label="Quitar imagen"
              className={`${ICON_BUTTON} absolute top-1 right-1`}
            >
              ✕
            </button>

            <div className="absolute bottom-1 left-1 right-1 flex justify-between">
              <button
                type="button"
                onClick={() => move(index, index - 1)}
                disabled={uploading || index === 0}
                aria-label="Mover a la izquierda"
                className={ICON_BUTTON}
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => move(index, index + 1)}
                disabled={uploading || index === imageUrls.length - 1}
                aria-label="Mover a la derecha"
                className={ICON_BUTTON}
              >
                ›
              </button>
            </div>
          </div>
        ))}

        {remaining > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-28 h-28 rounded-lg border-2 border-dashed border-border text-sm text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-1"
          >
            <span className="text-2xl leading-none">+</span>
            <span>{uploading ? "Subiendo..." : "Agregar"}</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={handleFiles}
        className="hidden"
      />
    </div>
  );
}
