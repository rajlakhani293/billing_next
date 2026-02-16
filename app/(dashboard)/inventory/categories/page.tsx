"use client";

import { useState, useMemo } from "react";
import { useTableData } from "@/hooks/useTableData";
import DynamicTable from "@/components/DynamicTable";
import { items } from "@/lib/api/items";
import { CategoryForm } from "./createUpdate";
import { EditIcon } from "@/components/AppIcon";

const Categories = () => {
  const [isAddEntityOpen, setAddEntityOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const {
    orders,
    totalItems,
    isLoading,
    currentPage,
    setCurrentPage,
    sortConfig,
    handleSort,
    sortableFields,
    handleFilterChange,
    searchTerm,
    selectedDateRange,
    dateFilters,
    itemsPerPage,
  } = useTableData({
    getMaster: items.useGetItemCategoriesDataMutation,
    itemsPerPage: 20,
  });

  const handleCreateItem = () => {
    setEditingItem(null);
    setAddEntityOpen(true);
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setAddEntityOpen(true);
  };

  const handleClose = () => {
    setAddEntityOpen(false);
    setEditingItem(null);
  };

  const columns = useMemo(
    () => [
      {
        key: "name",
        title: "Category Name",
      },
      {
        key: "description",
        title: "Description",
      }
    ],
    [currentPage, itemsPerPage]
  );

  return (
    <>
      <div className="p-4">
        <DynamicTable
          tableTitle="Categories"
          title="Add Category"
          showSearch={true}
          searchTerm={searchTerm}
          showDateRange={true}
          selectedDateRange={selectedDateRange}
          dateFilters={dateFilters}
          setAddEntityOpen={handleCreateItem}
          onFilterChange={handleFilterChange}
          data={orders}
          columns={columns}
          sortConfig={sortConfig}
          onSort={handleSort}
          sortableFields={sortableFields}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          showDelete={true}
          isLoading={isLoading}
          onEdit={handleEditItem}
        />
      </div>

      <CategoryForm
        isOpen={isAddEntityOpen}
        onClose={handleClose}
        onSuccess={() => {
          console.log("Form submitted successfully");
        }}
        id={editingItem?.id}
        initialData={editingItem}
        isEditing={!!editingItem}
        title={editingItem ? "Edit Category" : "Create New Category"}
      />
    </>
  );
};

export default Categories;
