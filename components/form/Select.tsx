"use client";

import { ReactNode, SelectHTMLAttributes, useState } from "react";
import { FormField } from "./FormField";
import { FORM_STYLES, FORM_SIZES, FormSize } from "@/src/config/ui";
import { Validator } from "@/src/lib/validators";

interface SelectProps
  extends Omit<
    SelectHTMLAttributes<HTMLSelectElement>,
    "size" | "onChange" | "value"
  > {
  label?: string;
  required?: boolean;
  helperText?: string;
  size?: FormSize;
  validate?: Validator;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}

export function Select({
  label,
  required = false,
  helperText,
  size = "md",
  validate,
  value,
  onChange,
  id,
  className = "",
  children,
  ...rest
}: SelectProps) {
  const [touched, setTouched] = useState(false);
  const error = touched && validate ? validate(value) : null;

  const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");
  const stateStyles = error ? FORM_STYLES.inputError : FORM_STYLES.inputDefault;

  return (
    <FormField
      label={label}
      htmlFor={selectId}
      required={required}
      error={error}
      helperText={!error ? helperText : undefined}
    >
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        className={`${FORM_STYLES.inputBase} ${FORM_SIZES[size].input} ${stateStyles} ${className}`}
        {...rest}
      >
        {children}
      </select>
    </FormField>
  );
}
