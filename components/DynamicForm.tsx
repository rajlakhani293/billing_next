"use client"

import { useState, useEffect, useRef } from "@/lib/imports";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CloseIcon } from "./AppIcon";
import { Spinner } from "./ui/spinner";

interface FormField {
  name: string;
  label: string;
  type?: "text" | "number" | "select" | "textarea" | "switch" | "date" | "hidden" | "readonly" | "radio";
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string | number }[];
  multiple?: boolean;
  rows?: number;
  note?: string;
  maxLength?: number;
  icon?: React.ReactNode;
  validation?: any;
  custom_msg?: string;
  dataType?: string;
  showCheckbox?: boolean;
  custom?: React.ReactNode | ((formikProps: any) => React.ReactNode);
  checkedText?: string;
  unCheckedText?: string;
  allowClear?: boolean;
  defaultValue?: any;
  checkedValue?: any;
  unCheckedValue?: any;
}

interface DynamicFormProps<T> {
  fields: FormField[];
  initialValues: T;
  onSubmit: (values: T, formikHelpers: any) => void | Promise<any>;
  onClose?: () => void;
  onSuccess?: () => void;
  title?: string;
  note?: string;
  isOpen?: boolean;
  custom?: string;
  children?: (formikProps: any) => React.ReactNode;
  validationSchema?: any;
  formWidth?: string | number;
  extra?: (formikProps: any) => React.ReactNode;
}

const DynamicForm = <T extends Record<string, any>>({
  fields,
  initialValues,
  onSubmit,
  onClose,
  formWidth,
  onSuccess,
  title = "Form Title",
  note,
  isOpen = false,
  children,
  validationSchema,
  extra,
}: DynamicFormProps<T>) => {
  // Convert formWidth to CSS class
  const getWidthClass = (width: string | number | undefined): string => {
    if (!width) return 'w-[600px]'; 
    if (typeof width === 'string') return width;
    return `w-[${width}px]`;
  };

  const [formData, setFormData] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const drawerContentRef = useRef<HTMLDivElement>(null);

  // Reset isSubmitting when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Manage focus to prevent aria-hidden issues
  useEffect(() => {
    if (isOpen && drawerContentRef.current) {
      // Small delay to ensure drawer is fully open
      const timeoutId = setTimeout(() => {
        // Move focus to the drawer content to prevent aria-hidden conflicts
        drawerContentRef.current?.focus();
      }, 50);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  // Update form data when initialValues changes
  useEffect(() => {
    setFormData(initialValues);
    setErrors({});
  }, [initialValues]);

  const validateField = (name: string, value: any) => {
    // If external validation schema is provided, don't use built-in validation
    if (validationSchema) {
      return '';
    }

    const field = fields.find(f => f.name === name);
    if (!field) return '';

    if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return field.custom_msg || `${field.label} is required`;
    }

    if (field.type === 'number' && value && isNaN(Number(value))) {
      return `${field.label} must be a valid number`;
    }

    return '';
  };

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate all fields
    const newErrors: Record<string, string> = {};
    
    if (validationSchema) {
      // Use external validation schema if provided
      try {
        await validationSchema.validate(formData, { abortEarly: false });
      } catch (validationError: any) {
        if (validationError.inner) {
          validationError.inner.forEach((error: any) => {
            newErrors[error.path] = error.message;
          });
        }
      }
    } else {
      // Use built-in validation
      fields.forEach(field => {
        const error = validateField(field.name, formData[field.name]);
        if (error) newErrors[field.name] = error;
      });
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        await onSubmit(formData, {
          setSubmitting: setIsSubmitting,
          resetForm: () => setFormData(initialValues),
        });
        setIsSubmitting(false);
        onSuccess?.();
      } catch (error) {
        console.error("Submit failed:", error);
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      // Add a delay to prevent aria-hidden focus issues during drawer close animation
      setTimeout(() => {
        setFormData(initialValues);
        setErrors({});
        onClose?.();
      }, 100); // Increased delay to ensure drawer close animation completes
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && handleClose()} direction="right">
      <DrawerContent 
        ref={drawerContentRef}
        className={`h-full ${getWidthClass(formWidth)} flex flex-col`}
        tabIndex={-1}
      >
        <DrawerHeader className="border-b shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle>{title}</DrawerTitle>
              {note ? (
                <DrawerDescription>{note}</DrawerDescription>
              ) : (
                <DrawerDescription className="sr-only">
                  Form dialog for {title || 'form'}
                </DrawerDescription>
              )}
            </div>
            <div className="flex items-center gap-2">
              {extra && extra({ formData, handleChange, errors })}
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
                  <CloseIcon className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </div>
        </DrawerHeader>
        
        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                </Label>

                {field.type === "hidden" ? (
                  <input type="hidden" name={field.name} value={formData[field.name] || ''} />
                ) : field.type === "select" && field.options ? (
                  <Select
                    value={formData[field.name] || ''}
                    onValueChange={(value) => handleChange(field.name, value)}
                  >
                    <SelectTrigger className={errors[field.name] ? 'border-red-500' : ''}>
                      <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.filter(option => option != null && option.value != null).map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === "textarea" ? (
                  <textarea
                    id={field.name}
                    rows={field.rows || 3}
                    placeholder={field.placeholder}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    maxLength={field.maxLength}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors[field.name] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                ) : field.type === "number" ? (
                  <Input
                    type="number"
                    id={field.name}
                    placeholder={field.placeholder}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    min="0"
                    step="0.01"
                    className={errors[field.name] ? 'border-red-500' : ''}
                  />
                ) : field.type === "readonly" ? (
                  <Input
                    type="text"
                    id={field.name}
                    placeholder={field.placeholder}
                    value={formData[field.name] || ''}
                    readOnly
                    className={`bg-gray-100 cursor-not-allowed ${errors[field.name] ? 'border-red-500' : ''}`}
                  />
                ) : (
                  <Input
                    type={field.type || "text"}
                    id={field.name}
                    placeholder={field.placeholder}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    maxLength={field.maxLength}
                    className={errors[field.name] ? 'border-red-500' : ''}
                  />
                )}

                {errors[field.name] && (
                  <p className="text-sm text-red-500">{errors[field.name]}</p>
                )}
                
                {field.note && (
                  <p className="text-sm text-gray-500">Note: {field.note}</p>
                )}
              </div>
            ))}

            {typeof children === "function" && children({ formData, handleChange, errors })}
          </form>
        </div>

        <div className="border-t p-4 shrink-0 flex justify-end">
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[120px]" onClick={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Spinner />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center">
                  Save
                </span>
              )}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default DynamicForm;
