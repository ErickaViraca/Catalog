import { ReactNode } from "react";
import { FORM_STYLES } from "@/src/config/ui";

interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  error?: string | null;
  helperText?: string;
  children: ReactNode;
}

// Wrapper compartido por Input/Select/Textarea: label + asterisco (si es
// requerido) + el control + mensaje de error o texto de ayuda debajo.
export function FormField({
  label,
  htmlFor,
  required = false,
  error,
  helperText,
  children,
}: FormFieldProps) {
  return (
    <div>
      {label && (
        <label htmlFor={htmlFor} className={FORM_STYLES.label}>
          {label}
          {required && <span className={FORM_STYLES.requiredMark}>*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className={FORM_STYLES.errorText}>{error}</p>
      ) : helperText ? (
        <p className={FORM_STYLES.helperText}>{helperText}</p>
      ) : null}
    </div>
  );
}
