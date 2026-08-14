"use client";

import { Button } from "./Button";
import { AlertTriangleIcon } from "./icons";

interface AlertModalProps {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export function AlertModal({ open, title, message, onClose }: AlertModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-start gap-3 mb-6">
          <div className="shrink-0 w-10 h-10 rounded-full bg-danger-bg border border-danger-border flex items-center justify-center">
            <AlertTriangleIcon size={20} className="text-danger" />
          </div>
          <div>
            <h3 className="text-lg font-bold">{title}</h3>
            <p className="text-sm text-muted mt-1">{message}</p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose}>Entendido</Button>
        </div>
      </div>
    </div>
  );
}
