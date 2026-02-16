"use client"

import { useEffect, useState } from "@/lib/imports";
import DynamicForm from "@/components/DynamicForm";
import { items } from "@/lib/api/items";

interface UnitFormProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  id?: string | null;
  title?: string;
  initialData?: any;
  isEditing?: boolean;
}

export function UnitForm({ 
  isOpen, 
  onClose, 
  onSuccess, 
  id, 
  title, 
  initialData,
  isEditing = false 
}: UnitFormProps) {
  const [createItemUnit] = items.useCreateItemUnitMutation();
  const [editItemUnit] = items.useEditItemUnitMutation();
  const [getItemUnitData] = items.useGetItemUnitByIdMutation();

  const UnitSchema = [
  { 
    name: "name", 
    label: "Unit Name", 
    placeholder: "e.g. Pieces", 
    required: true 
  },
  { 
    name: "code", 
    label: "Unit Code", 
    placeholder: "e.g. PCS",
    required: true
  },
  { 
    name: "description", 
    label: "Description", 
    type: "textarea" as const,
    placeholder: "Enter a detailed description...",
    rows: 3
  }
];

  const [initialValues, setInitialValues] = useState({
    name: "",
    code: "",
    description: "",
  });

  /** Submit handler */
  const handleSubmit = async (values: any, { resetForm }: any) => {
    try {
      const processedValues = {
        ...values,
      };

      const result = isEditing && id
        ? await editItemUnit({ id, payLoad: processedValues }).unwrap()
        : await createItemUnit(processedValues).unwrap();

      resetForm();
      onClose?.();
      onSuccess?.();

      return result;
    } catch (error) {
      console.error("Submit failed:", error);
      return error;
    }
  };

  /** Load data if editing */
  const handleGetItemUnit = async (id: any) => {
    try {
      const result = await getItemUnitData({ id: parseInt(id) }).unwrap();
      if (result && typeof result === 'object' && 'data' in result) {
        setInitialValues({
          name: (result as any).data.name || "",
          code: (result as any).data.code || "",
          description: (result as any).data.description || "",
        });
      }
    } catch (e) {
      console.error("Fetch failed:", e);
    }
  };

  /** Sync when opening */
  useEffect(() => {
    if (id && isOpen) {
      handleGetItemUnit(id);
    } else if (isOpen && !isEditing && initialData) {
      setInitialValues(initialData);
    } else if (isOpen && !isEditing) {
      setInitialValues({
        name: "",
        code: "",
        description: ""
      });
    }
  }, [id, isOpen]);

  return (
    <DynamicForm
      fields={UnitSchema}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      onClose={onClose}
      onSuccess={onSuccess}
      isOpen={isOpen}
      title={title || (isEditing ? "Edit Unit" : "Create New Unit")}
    />
  );
}
