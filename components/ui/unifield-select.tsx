"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldError, FieldLabel } from "./field"

interface UniFieldSelectProps {
  label?: string
  error?: string
  touched?: boolean
  containerClassName?: string
  value?: string
  onValueChange?: (value: string) => void
  required?: boolean
  placeholder?: string
  children?: React.ReactNode
  validationError?: string
}

export const UniFieldSelect = ({
  label,
  error,
  touched,
  containerClassName,
  value,
  onValueChange,
  required = false,
  placeholder,
  children,
  validationError,
}: UniFieldSelectProps) => {
    return (
     <Field data-invalid={error && touched ? true : undefined} className={cn("w-full gap-1", containerClassName)}>
      {label && <FieldLabel>{label} {required && <span className="text-red-500">*</span>}</FieldLabel>}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger aria-invalid={error && touched ? true : undefined}>
          <SelectValue placeholder={placeholder || "Select an option"} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {children}
          </SelectGroup>
        </SelectContent>
      </Select>
      {(error && touched) && <FieldError>{error}</FieldError>}
      {validationError && <FieldError>{validationError}</FieldError>}
    </Field>
    )
  }
