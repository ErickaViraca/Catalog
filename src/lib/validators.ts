// Validadores genéricos y reutilizables para todos los formularios del
// admin (Brands, Categories, Products). Cada validador es una función
// que recibe el valor del campo y devuelve un mensaje de error en
// español, o null si el valor es válido.

export type Validator = (value: unknown) => string | null;

export function required(fieldLabel: string): Validator {
  return (value) => {
    if (value === undefined || value === null) {
      return `${fieldLabel} es requerido`;
    }
    if (typeof value === "string" && value.trim().length === 0) {
      return `${fieldLabel} es requerido`;
    }
    return null;
  };
}

export function minLength(min: number, fieldLabel: string): Validator {
  return (value) => {
    if (typeof value !== "string" || value.trim().length === 0) return null;
    if (value.trim().length < min) {
      return `${fieldLabel} debe tener al menos ${min} caracteres`;
    }
    return null;
  };
}

export function maxLength(max: number, fieldLabel: string): Validator {
  return (value) => {
    if (typeof value !== "string") return null;
    if (value.length > max) {
      return `${fieldLabel} no puede superar los ${max} caracteres`;
    }
    return null;
  };
}

export function positiveNumber(fieldLabel: string): Validator {
  return (value) => {
    if (value === "" || value === undefined || value === null) return null;
    const num = Number(value);
    if (Number.isNaN(num)) return `${fieldLabel} debe ser un número válido`;
    if (num < 0) return `${fieldLabel} no puede ser negativo`;
    return null;
  };
}

export function nonNegativeInteger(fieldLabel: string): Validator {
  return (value) => {
    if (value === "" || value === undefined || value === null) return null;
    const num = Number(value);
    if (!Number.isInteger(num)) return `${fieldLabel} debe ser un número entero`;
    if (num < 0) return `${fieldLabel} no puede ser negativo`;
    return null;
  };
}

export function slugFormat(fieldLabel: string): Validator {
  return (value) => {
    if (typeof value !== "string" || value.length === 0) return null;
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(value)) {
      return `${fieldLabel} solo puede tener minúsculas, números y guiones`;
    }
    return null;
  };
}

export function alphanumericFormat(fieldLabel: string): Validator {
  return (value) => {
    if (typeof value !== "string" || value.length === 0) return null;
    if (!/^[a-zA-Z0-9-]+$/.test(value)) {
      return `${fieldLabel} solo puede tener letras, números y guiones`;
    }
    return null;
  };
}

export function selected(fieldLabel: string): Validator {
  return (value) => {
    if (!value) return `Selecciona ${fieldLabel}`;
    return null;
  };
}

// Combina varios validadores para un mismo campo; se detiene en el
// primer error encontrado.
export function combine(...validators: Validator[]): Validator {
  return (value) => {
    for (const validate of validators) {
      const error = validate(value);
      if (error) return error;
    }
    return null;
  };
}

// Corre un schema {campo: validator} contra un objeto de datos y
// devuelve el mapa de errores {campo: mensaje} (solo las claves con error).
export function validateForm<T extends Record<string, unknown>>(
  data: T,
  schema: Partial<Record<keyof T, Validator>>
): Partial<Record<keyof T, string>> {
  const errors: Partial<Record<keyof T, string>> = {};

  for (const key in schema) {
    const validate = schema[key];
    if (!validate) continue;
    const error = validate(data[key]);
    if (error) errors[key] = error;
  }

  return errors;
}
