"use client";

interface ToastProps {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}

export function Toast({ type, message, onClose }: ToastProps) {
  const styles =
    type === "success"
      ? "bg-success-bg border-success-border text-success"
      : "bg-danger-bg border-danger-border text-danger";

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg ${styles}`}
      role="alert"
    >
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="font-bold leading-none hover:opacity-70"
        aria-label="Cerrar"
      >
        ✕
      </button>
    </div>
  );
}
