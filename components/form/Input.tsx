"use client";

import { InputHTMLAttributes, useState } from "react";
import { FormField } from "./FormField";
import { CheckIcon, XIcon } from "./icons";
import { FORM_STYLES, FORM_SIZES, FormSize } from "@/src/config/ui";
import { Validator } from "@/src/lib/validators";

interface InputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "size" | "onChange" | "value"
  > {
  label?: string;
  required?: boolean;
  helperText?: string;
  size?: FormSize;
  validate?: Validator;
  value: string | number;
  onChange: (value: string) => void;
  // Fuerza a mostrar el estado de validación aunque el usuario no haya
  // hecho blur todavía — se usa al intentar enviar el formulario.
  forceTouched?: boolean;
}

// Input de texto/número reutilizable: label + asterisco + ícono ✓/✗ +
// mensaje de error, todo controlado por un único validador opcional.
// El ícono y el error solo aparecen después de que el usuario interactúa
// con el campo (onBlur), no mientras escribe por primera vez.
export function Input({
  label,
  required = false,
  helperText,
  size = "md",
  validate,
  value,
  onChange,
  forceTouched = false,
  id,
  className = "",
  ...rest
}: InputProps) {
  const [blurred, setBlurred] = useState(false);
  const touched = blurred || forceTouched;

  const error = touched && validate ? validate(value) : null;
  const hasValue = String(value ?? "").length > 0;
  const isValid = touched && !!validate && !error && hasValue;

  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  const showIcon = touched && !!validate && (!!error || isValid);

  const stateStyles = error
    ? FORM_STYLES.inputError
    : isValid
      ? FORM_STYLES.inputValid
      : FORM_STYLES.inputDefault;

  return (
    <FormField
      label={label}
      htmlFor={inputId}
      required={required}
      error={error}
      helperText={!error ? helperText : undefined}
    >
      <div className={FORM_STYLES.fieldWrapper}>
        <input
          id={inputId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setBlurred(true)}
          className={`${FORM_STYLES.inputBase} ${FORM_SIZES[size].input} ${stateStyles} ${
            validate ? "pr-10" : ""
          } ${className}`}
          {...rest}
        />
        {showIcon && (
          <span className={FORM_STYLES.validationIconWrapper}>
            {error ? (
              <XIcon size={FORM_SIZES[size].icon} />
            ) : (
              <CheckIcon size={FORM_SIZES[size].icon} />
            )}
          </span>
        )}
      </div>
    </FormField>
  );
}
