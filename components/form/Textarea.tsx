"use client";

import { TextareaHTMLAttributes, useState } from "react";
import { FormField } from "./FormField";
import { FORM_STYLES, FORM_SIZES, FormSize } from "@/src/config/ui";
import { Validator } from "@/src/lib/validators";

interface TextareaProps
  extends Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    "size" | "onChange" | "value"
  > {
  label?: string;
  required?: boolean;
  helperText?: string;
  size?: FormSize;
  validate?: Validator;
  value: string;
  onChange: (value: string) => void;
}

export function Textarea({
  label,
  required = false,
  helperText,
  size = "md",
  validate,
  value,
  onChange,
  id,
  className = "",
  ...rest
}: TextareaProps) {
  const [touched, setTouched] = useState(false);
  const error = touched && validate ? validate(value) : null;

  const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");
  const stateStyles = error ? FORM_STYLES.inputError : FORM_STYLES.inputDefault;

  return (
    <FormField
      label={label}
      htmlFor={textareaId}
      required={required}
      error={error}
      helperText={!error ? helperText : undefined}
    >
      <textarea
        id={textareaId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        className={`${FORM_STYLES.inputBase} ${FORM_SIZES[size].input} ${stateStyles} ${className}`}
        {...rest}
      />
    </FormField>
  );
}
