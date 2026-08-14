"use client";

import { ReactNode } from "react";
import { Button } from "./Button";

interface ModalProps {
  open: boolean;
  title: string;
  onCancel: () => void;
  onSave: () => void;
  saving?: boolean;
  saveLabel?: string;
  children: ReactNode;
}

// Modal genérico para editar un registro existente (marca/categoría/
// producto): overlay + panel con los campos que pase el caller + footer
// fijo con Cancelar (gris) y Guardar (verde, mismo tono que el badge
// "Activo" de las tablas), alineados a la derecha.
export function Modal({
  open,
  title,
  onCancel,
  onSave,
  saving = false,
  saveLabel = "Guardar",
  children,
}: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="px-6 py-6 overflow-y-auto">
          <h3 className="text-xl font-bold mb-6">{title}</h3>
          {children}
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-border bg-gray-50 rounded-b-lg">
          <Button variant="secondary" onClick={onCancel} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="success" onClick={onSave} disabled={saving}>
            {saving ? "Guardando..." : saveLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
