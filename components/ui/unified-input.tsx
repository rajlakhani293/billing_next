"use client"

import React, { forwardRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components"

interface UnifiedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>, 'prefix' | 'onChange' | 'onFocus' | 'onBlur' | 'onKeyDown'> {
  label?: string;
  error?: string;
  helperText?: string;
  hideErrorMessage?: boolean;
  mainClassName?: string;
  as?: 'input' | 'textarea';
  rows?: number;
  leftIcon?: React.ReactNode;
  leftText?: string;
  rightIcon?: React.ReactNode;
  rightText?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  isPhoneNumber?: boolean;
  countryCode?: string;
  allowClear?: boolean;
  onClear?: () => void;
  isNumber?: boolean;
  autoSelect?: boolean;
  resetOnBlur?: boolean;
  validateKeys?: boolean;
  allowDots?: boolean;
  addonType?: 'button';
  buttonText?: string;
  buttonProps?: React.ComponentProps<typeof Button>;
  onButtonClick?: () => void;
  buttonClassName?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const UnifiedInput = forwardRef<HTMLInputElement | HTMLTextAreaElement, UnifiedInputProps>(
  ({ 
    label, error, helperText, hideErrorMessage = false, mainClassName, 
    as = 'input', rows, leftIcon, leftText, rightIcon, rightText, prefix, suffix,
    isPhoneNumber = false, countryCode = '+91', maxLength, allowClear = false, onClear,
    isNumber = false, autoSelect = false, resetOnBlur = false, validateKeys = false,
    allowDots = true, min, max, step, addonType, buttonText, buttonProps,
    onButtonClick, buttonClassName, onChange, onFocus, onBlur, onKeyDown, ...props 
  }, ref) => {
    
    const [inputValue, setInputValue] = useState(props.value || props.defaultValue || '');

    // Sync internal state if props.value changes externally
    useEffect(() => {
        if (props.value !== undefined) setInputValue(props.value);
    }, [props.value]);

    const isTextarea = as === 'textarea';

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/\D/g, '');
      const effectiveMaxLength = maxLength || 10;
      if (value.length <= effectiveMaxLength) {
        setInputValue(value);
        onChange?.(e);
      }
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;
      if (validateKeys) {
        const regex = allowDots ? /^[0-9.-]*$/ : /^[0-9-]*$/;
        if (!regex.test(value) && value !== '') return;
        if (allowDots && value.split('.').length > 2) return;
      }
      // Enforce maxLength for number inputs
      if (maxLength && value.length > maxLength) {
        value = value.slice(0, maxLength);
      }
      setInputValue(value);
      onChange?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (validateKeys && (isNumber || isPhoneNumber)) {
        const allowedKeys = ["Backspace", "Tab", "Delete", "ArrowLeft", "ArrowRight", "Home", "End"];
        const isDigit = /[0-9]/.test(e.key);
        const isDot = e.key === ".";
        const isMinus = e.key === "-";
        const isCopyPaste = (e.metaKey || e.ctrlKey) && (["a", "c", "v"].includes(e.key));
        const allowNegative = min === undefined || Number(min) < 0;

        if (!isDigit && !allowedKeys.includes(e.key) && !isCopyPaste && !(allowDots && isDot) && !(allowNegative && isMinus)) {
          e.preventDefault();
        }
      }
      onKeyDown?.(e);
    };

    const handleClear = () => {
      setInputValue('');
      if (onClear) onClear();
      const event = { target: { ...props, value: '' } } as any;
      onChange?.(event);
    };

    const calculatePadding = () => {
      let classes = "px-3 py-2";
      if (prefix || isPhoneNumber) classes += " pl-12";
      else if (leftIcon || leftText) classes += " pl-10";
      
      if (suffix) classes += " pr-12";
      else if (rightIcon || rightText || allowClear) classes += " pr-10";
      
      return classes;
    };

    const sharedClasses = cn(
      "w-full rounded-md border-2 outline-none transition-all duration-200 bg-white text-slate-900",
      "placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed",
      "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
      calculatePadding(),
      error ? "border-red-500 focus:ring-red-200" : "border-slate-200 focus:border-black focus:ring-4 focus:ring-black/10",
      props.className
    );

    const inputContent = isTextarea ? (
      <textarea
        ref={ref as any}
        rows={rows || 3}
        className={cn(sharedClasses, "resize-y")}
        value={inputValue}
        onChange={(e) => { setInputValue(e.target.value); onChange?.(e); }}
        onFocus={onFocus as any}
        onBlur={(e) => {
          onBlur?.(e);
          onChange?.(e);
        }}
        onKeyDown={handleKeyDown}
        {...(props as any)}
      />
    ) : (
      <input
        ref={ref as any}
        type={isPhoneNumber ? 'tel' : isNumber ? 'text' : props.type}
        className={sharedClasses}
        value={inputValue}
        onChange={isPhoneNumber ? handlePhoneChange : isNumber ? handleNumberChange : (e) => { 
          let value = e.target.value;
          // Enforce maxLength for regular inputs
          if (maxLength && value.length > maxLength) {
            value = value.slice(0, maxLength);
          }
          setInputValue(value); 
          // Create a new event with the truncated value
          const truncatedEvent = { ...e, target: { ...e.target, value } };
          onChange?.(truncatedEvent); 
        }}
        onFocus={onFocus as any}
        onBlur={(e) => {
          onBlur?.(e);
          onChange?.(e);
        }}
        onKeyDown={handleKeyDown}
        {...props}
      />
    );

    return (
      <div className={cn("w-full flex flex-col gap-1.5", mainClassName)}>
        {label && <label className="text-sm font-medium text-slate-700">{label}{props.required && <span className="text-red-500 ml-1">*</span>}</label>}

        <div className="flex items-stretch">
          <div className="relative flex-grow flex items-center">
            {/* Left Elements */}
            {(prefix || isPhoneNumber) && (
              <span className="absolute left-3 z-10 text-slate-500 font-medium">
                {isPhoneNumber ? countryCode : prefix}
              </span>
            )}
            {(leftIcon || leftText) && (
              <span className={cn("absolute z-10 text-slate-400", (prefix || isPhoneNumber) ? "left-12" : "left-3")}>
                {leftIcon || leftText}
              </span>
            )}

            {inputContent}

            {/* Right Elements */}
            {(rightIcon || rightText) && (
              <span className={cn("absolute right-3 z-10 text-slate-400", suffix && "right-12")}>
                {rightIcon || rightText}
              </span>
            )}
            {suffix && (
              <span className="absolute right-3 z-10 text-slate-500 font-medium">
                {suffix}
              </span>
            )}

            {/* Clear Button */}
            {allowClear && inputValue && !rightIcon && !rightText && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Addon Button */}
          {addonType === 'button' && (
            <Button
              type="button"
              onClick={onButtonClick}
              className={cn("rounded-l-none border-l-0 h-auto", buttonClassName)}
              {...buttonProps}
            >
              {buttonText || 'Submit'}
            </Button>
          )}
        </div>

        {/* Error or Helper Text */}
        {error && !hideErrorMessage ? (
          <p className="text-xs text-red-500">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

UnifiedInput.displayName = 'UnifiedInput';