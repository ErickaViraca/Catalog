// Mensajes compartidos entre el backend (services, que hacen cumplir la
// regla) y el admin panel (que hace un pre-chequeo para decidir qué modal
// mostrar) — un solo lugar para no tener el mismo texto duplicado y
// desincronizado en dos archivos.
export const BRAND_IN_USE_MESSAGE =
  "No se puede eliminar esta marca debido a que existen productos con esta marca.";

export const CATEGORY_IN_USE_MESSAGE =
  "No se puede eliminar esta categoría debido a que existen productos con esta categoría.";

export const BRAND_IN_USE_DEACTIVATE_MESSAGE =
  "No se puede desactivar esta marca debido a que existen productos con esta marca.";

export const CATEGORY_IN_USE_DEACTIVATE_MESSAGE =
  "No se puede desactivar esta categoría debido a que existen productos con esta categoría.";
