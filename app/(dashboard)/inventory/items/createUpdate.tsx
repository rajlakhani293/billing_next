"use client"

import { useEffect, useState } from "@/lib/imports";
import DynamicForm from "@/components/DynamicForm";
import { items } from "@/lib/api/items";

interface ItemFormProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  id?: string | null;
  title?: string;
  initialData?: any;
  isEditing?: boolean;
}

export function ItemForm({ 
  isOpen, 
  onClose, 
  onSuccess, 
  id, 
  title, 
  initialData,
  isEditing = false 
}: ItemFormProps) {
  const [createItem] = items.useCreateItemMutation();
  const [editItem] = items.useEditItemMutation();
  const [getItemData] = items.useGetItemByIdMutation();

  const ItemSchema = [
  { 
    name: "item_name", 
    label: "Item Name", 
    placeholder: "e.g. Premium Widget", 
    required: true 
  },
  { 
    name: "description", 
    label: "Description", 
    type: "textarea" as const,
    placeholder: "Enter a detailed description...",
    rows: 3
  },
  { 
    name: "category", 
    label: "Category", 
    type: "select" as const,
    placeholder: "Select Category",
    required: true,
    options: [
      { label: "Widgets", value: "Widgets" },
      { label: "Gadgets", value: "Gadgets" },
      { label: "Tools", value: "Tools" },
      { label: "Electronics", value: "Electronics" }
    ]
  },
  { 
    name: "selling_price", 
    label: "Selling Price", 
    type: "number" as const,
    placeholder: "0.00",
    required: true,
    min: 0,
    step: 0.01
  },
];

  const [initialValues, setInitialValues] = useState({
    item_name: "",
    description: "",
    category: "",
    selling_price: "",
  });

  /** Submit handler */
  const handleSubmit = async (values: any, { resetForm }: any) => {
    try {
      const processedValues = {
        ...values,
        selling_price: parseFloat(values.selling_price) || 0,
      };

      const result = isEditing && id
        ? await editItem({ id, payLoad: processedValues }).unwrap()
        : await createItem(processedValues).unwrap();

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
  const handleGetItem = async (id: any) => {
    try {
      const result = await getItemData({ id: parseInt(id) }).unwrap();
      if (result && typeof result === 'object' && 'data' in result) {
        setInitialValues({
          item_name: (result as any).data.item_name || "",
          description: (result as any).data.description || "",
          category: (result as any).data.category || "",
          selling_price: (result as any).data.selling_price?.toString() || "",
        });
      }
    } catch (e) {
      console.error("Fetch failed:", e);
    }
  };

  /** Sync when opening */
  useEffect(() => {
    if (id && isOpen) {
      handleGetItem(id);
    } else if (isOpen && initialData) {
      setInitialValues(initialData);
    } else if (isOpen) {
      setInitialValues({
        item_name: "",
        description: "",
        category: "",
        selling_price: ""
      });
    }
  }, [id, isOpen, initialData]);

  return (
    <DynamicForm
      fields={ItemSchema}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      onClose={onClose}
      onSuccess={onSuccess}
      isOpen={isOpen}
      title={title || (isEditing ? "Edit Item" : "Create New Item")}
    />
  );
}
