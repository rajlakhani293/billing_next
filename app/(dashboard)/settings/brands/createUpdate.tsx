"use client"

import { useEffect, useState } from "@/lib/imports";
import DynamicForm from "@/components/DynamicForm";
import { items } from "@/lib/api/items";
import { FormField, getInitialFormValues } from "@/lib/utils";
import toast from "react-hot-toast";

interface BrandFormProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  id?: string | null;
  title?: string;
}

const Schema: FormField[] = [
  { 
    name: "brand_name", 
    label: "Brand Name", 
    placeholder: "e.g. Apple", 
    required: true 
  }
];

export function BrandForm({ 
  isOpen, 
  onClose, 
  onSuccess, 
  id, 
  title, 
}: BrandFormProps) {
  const [createBrand] = items.useCreateBrandMutation();
  const [editBrand] = items.useEditBrandMutation();
  const [getBrandData] = items.useGetBrandByIdMutation();

  const [initialValues, setInitialValues] = useState<any>(() => getInitialFormValues(Schema));
  
  /** Submit handler */
  const handleSubmit = async (values: any, { resetForm }: any) => {
    try {
      const processedValues = {
        ...values,
      };

      const result: any = id
        ? await editBrand({ id, payLoad: processedValues }).unwrap()
        : await createBrand(processedValues).unwrap();

      if (result?.success) {
        const message = id ? "Brand updated successfully!" : "Brand created successfully!";
        toast.success(message);
        resetForm();
        onClose?.();
        onSuccess?.();
      } else {
        toast.error((result as any)?.message || "Operation failed");
      }

      return result;
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Operation failed";
      toast.error(errorMessage);
      console.error("Submit failed:", error);
      return error;
    }
  };

  /** Load data if editing */
  const handleGetMaster = async (id: any) => {
    try {
      const result: any = await getBrandData({ id: parseInt(id) }).unwrap();
      const data = result.data;
      if (result?.data) {
        const baseValues = getInitialFormValues(Schema, data);
        setInitialValues(baseValues);
      }
    } catch (e) {
      console.error("Fetch failed:", e);
    }
  };

  /** Sync when opening or when id changes */
  useEffect(() => {
    if (isOpen) {
      if (id) {
        handleGetMaster(id);
      } else {
        setInitialValues(
          getInitialFormValues(Schema, null, 'create')
        );
      }
    }
  }, [id, isOpen]);

  /** Reset form when closing */
  useEffect(() => {
    if (!isOpen) {
      setInitialValues(getInitialFormValues(Schema));
    }
  }, [isOpen]);

  return (
    <DynamicForm
      fields={Schema}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      onClose={onClose}
      isOpen={isOpen}
      title={title}
    />
  );
}
