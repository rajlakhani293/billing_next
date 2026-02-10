"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "./textarea"

interface UniFieldInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'suffix'> {
  label?: string
  error?: string
  touched?: boolean
  containerClassName?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  as?: 'input' | 'textarea'
  rows?: number
}

export const UniFieldInput = React.forwardRef<HTMLInputElement, UniFieldInputProps>(
  ({ 
    label, 
    error, 
    touched, 
    containerClassName,
    className,
    id,
    prefix,
    suffix,
    as = 'input',
    rows = 3,
    onChange,
    ...props 
  }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    
    return (
      <div className={cn("space-y-1", containerClassName)}>
        {label && (
          <Label 
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700"
          >
            {label}
            {props.required && <span className="text-red-500">*</span>}
          </Label>
        )}
        <div className="relative">
          {prefix && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground z-10">
              {prefix}
            </div>
          )}
          {as === 'textarea' ? (
            <Textarea
              ref={ref as React.Ref<HTMLTextAreaElement>}
              id={inputId}
              rows={rows}
              className={cn(
                error && touched && "border-red-500 focus:border-red-500 focus:ring-red-500",
                className
              )}
              aria-invalid={error && touched ? true : undefined}
              value={props.value}
              placeholder={props.placeholder}
              disabled={props.disabled}
              required={props.required}
              onChange={onChange as any}
            />
          ) : (
            <Input
              ref={ref}
              id={inputId}
              className={cn(
                "h-10 border-2", // Set height to 14 (56px in Tailwind)
                error && touched && "border-red-500 focus:border-red-500 focus:ring-red-500",
                prefix && "pl-12",
                suffix && "pr-12",
                className
              )}
              aria-invalid={error && touched ? true : undefined}
              {...props}
              onChange={onChange as any}
            />
          )}
          {suffix && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground z-10">
              {suffix}
            </div>
          )}
        </div>
        {error && touched && (
          <p className="text-xs text-red-500 mt-1">
            {error}
          </p>
        )}
      </div>
    )
  }
)

UniFieldInput.displayName = "UniFieldInput"
