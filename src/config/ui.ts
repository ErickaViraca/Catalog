// Configuración centralizada de tamaños, spacing y tipografía para el
// sistema de formularios. Los colores viven en app/globals.css (@theme) —
// este archivo cubre todo lo demás: padding, radios, tamaños de ícono.
// Cambiar un valor acá lo actualiza en Brands, Categories y Products a la vez.

export const FORM_SIZES = {
  sm: {
    input: "px-3 py-1.5 text-sm",
    label: "text-xs",
    icon: 14,
  },
  md: {
    input: "px-4 py-2.5 text-base",
    label: "text-sm",
    icon: 18,
  },
} as const;

export type FormSize = keyof typeof FORM_SIZES;

export const FORM_STYLES = {
  label: "block font-medium text-label mb-1.5",
  requiredMark: "text-danger ml-0.5",
  helperText: "text-sm text-muted mt-1.5",
  errorText: "text-sm text-danger mt-1.5",

  inputBase:
    "w-full rounded-lg border bg-white transition-colors focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed",
  inputDefault: "border-border focus:border-primary focus:ring-primary/10",
  inputError: "border-danger focus:border-danger focus:ring-danger/10",
  inputValid: "border-success",

  fieldWrapper: "relative",
  validationIconWrapper: "absolute inset-y-0 right-0 flex items-center pr-3",

  // Padding de la tarjeta que envuelve cada formulario (Brand/Category/Product)
  cardPadding: "p-8",
} as const;

export const BUTTON_SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-base",
  lg: "px-6 py-3 text-lg",
} as const;

export type ButtonSize = keyof typeof BUTTON_SIZES;
