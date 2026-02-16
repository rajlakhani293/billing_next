"use client"

import { useEffect, useState } from "@/lib/imports";
import DynamicForm from "@/components/DynamicForm";
import { items } from "@/lib/api/items";

interface CategoryFormProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  id?: string | null;
  title?: string;
  initialData?: any;
  isEditing?: boolean;
}

export function CategoryForm({ 
  isOpen, 
  onClose, 
  onSuccess, 
  id, 
  title, 
  initialData,
  isEditing = false 
}: CategoryFormProps) {
  const [createItemCategory] = items.useCreateItemCategoryMutation();
  const [editItemCategory] = items.useEditItemCategoryMutation();
  const [getItemCategoryData] = items.useGetItemCategoryByIdMutation();

  const CategorySchema = [
  { 
    name: "name", 
    label: "Category Name", 
    placeholder: "e.g. Electronics", 
    required: true 
  },
  { 
    name: "short_name", 
    label: "Short Name", 
    placeholder: "Enter a short name...",
    required: true
  }
];

  const [initialValues, setInitialValues] = useState({
    name: "",
    short_name: "",
  });

  /** Submit handler */
  const handleSubmit = async (values: any, { resetForm }: any) => {
    try {
      const processedValues = {
        ...values,
      };

      const result = isEditing && id
        ? await editItemCategory({ id, payLoad: processedValues }).unwrap()
        : await createItemCategory(processedValues).unwrap();

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
  const handleGetItemCategory = async (id: any) => {
    try {
      const result = await getItemCategoryData({ id: parseInt(id) }).unwrap();
      if (result && typeof result === 'object' && 'data' in result) {
        setInitialValues({
          name: (result as any).data.name || "",
          short_name: (result as any).data.short_name || "",
        });
      }
    } catch (e) {
      console.error("Fetch failed:", e);
    }
  };

  /** Sync when opening */
  useEffect(() => {
    if (id && isOpen) {
      handleGetItemCategory(id);
    } else if (isOpen && !isEditing && initialData) {
      setInitialValues(initialData);
    } else if (isOpen && !isEditing) {
      setInitialValues({
        name: "",
        short_name: "",
      });
    }
  }, [id, isOpen]);

  return (
    <DynamicForm
      fields={CategorySchema}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      onClose={onClose}
      onSuccess={onSuccess}
      isOpen={isOpen}
      title={title || (isEditing ? "Edit Category" : "Create New Category")}
    />
  );
}
