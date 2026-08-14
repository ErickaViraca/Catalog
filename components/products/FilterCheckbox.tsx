"use client";

interface FilterCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
}

// Checkbox redondo con relleno azul al marcar, usado en los filtros del
// catálogo (categorías/marcas). Es un componente aparte del Checkbox de
// components/form — ese sigue con el estilo negro/primary del admin panel,
// este es específico para esta UI de filtros tipo e-commerce.
export function FilterCheckbox({ label, checked, onChange, id }: FilterCheckboxProps) {
  const checkboxId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label
      htmlFor={checkboxId}
      className="flex items-center gap-2.5 text-sm text-label cursor-pointer select-none"
    >
      <span className="relative inline-flex shrink-0">
        <input
          id={checkboxId}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          className="w-5 h-5 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center transition-colors
            peer-checked:bg-blue-600 peer-checked:border-blue-600
            peer-focus-visible:ring-2 peer-focus-visible:ring-blue-600/30"
        >
          {/* Blanco sobre blanco = invisible sin marcar; no hace falta togglear opacidad aparte */}
          <svg
            width="11"
            height="11"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
          >
            <path d="M4 10l4 4 8-8" />
          </svg>
        </span>
      </span>
      {label}
    </label>
  );
}
