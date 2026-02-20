import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQueryWithInterceptor } from "./base";
import { createMutation, deleteMutation, getMutation, patchMutation, postMutation, putMutation } from "./apiUtils";

const endpointsConfig = {
  //  Item Endpoints
  getItemsDropdown: { query: () => getMutation("dropdown-list") },
  getItemsData: { query: postMutation("get-transactions") },
  createItem: { query: createMutation("/") },
  editItem: { query: ({ id, payLoad }: { id: any; payLoad: any }) => putMutation(`/${id}`, payLoad) },
  deleteItem: { query: deleteMutation("delete") },
  getItemById: { query: ({ id }: { id: number }) => getMutation(`${id}`) },

  // Item Category Endpoints
  getItemCategoriesDropdown: { query: () => getMutation("categories/dropdown-list") },
  getItemCategoriesData: { query: postMutation("categories/get-transactions") },
  createItemCategory: { query: createMutation("categories/") },
  editItemCategory: { query: ({ id, payLoad }: { id: any; payLoad: any }) => putMutation(`categories/${id}`, payLoad) },
  deleteItemCategory: { query: deleteMutation("categories/delete") },
  getItemCategoryById: { query: ({ id }: { id: number }) => getMutation(`categories/${id}`) },

   // Item Unit Endpoints
  getItemUnitsDropdown: { query: () => getMutation("units/dropdown-list") },
  getItemUnitsData: { query: postMutation("units/get-transactions") },
  createItemUnit: { query: createMutation("units/") },
  editItemUnit: { query: ({ id, payLoad }: { id: any; payLoad: any }) => putMutation(`units/${id}`, payLoad) },
  deleteItemUnit: { query: deleteMutation("units/delete") },
  getItemUnitById: { query: ({ id }: { id: number }) => getMutation(`units/${id}`) },

  // Taxes
  getTaxesDropdown: { query: () => getMutation("taxes/dropdown-list") },
  getTaxesData: { query: postMutation("taxes/get-transactions") },
  createTax: { query: createMutation("taxes/") },
  editTax: { query: ({ id, payLoad }: { id: any; payLoad: any }) => putMutation(`taxes/${id}`, payLoad) },
  deleteTax: { query: deleteMutation("taxes/delete") },
  getTaxById: { query: ({ id }: { id: number }) => getMutation(`taxes/${id}`) },

  // Brand
  getBrandsDropdown: { query: () => getMutation("brands/dropdown-list") },
  getBrandsData: { query: postMutation("brands/get-transactions") },
  createBrand: { query: createMutation("brands/") },
  editBrand: { query: ({ id, payLoad }: { id: any; payLoad: any }) => putMutation(`brands/${id}`, payLoad) },
  deleteBrand: { query: deleteMutation("brands/delete") },
  getBrandById: { query: ({ id }: { id: number }) => getMutation(`brands/${id}`) },

}

export const items = createApi({
  reducerPath: "items",
  baseQuery: createBaseQueryWithInterceptor("items"),
  endpoints: (builder) => {
    const finalEndpoints: Record<string, any> = {};
    for (const [name, config] of Object.entries(endpointsConfig)) {
      if ((config as any).type === "query") {
        finalEndpoints[name] = builder.query(config as any);
      } else {
        finalEndpoints[name] = builder.mutation(config as any);
      }
    }
    return finalEndpoints;
  },
});
