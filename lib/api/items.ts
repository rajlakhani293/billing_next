import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQueryWithInterceptor } from "./base";
import { createMutation, deleteMutation, getMutation, patchMutation, postMutation, putMutation } from "./apiUtils";

const endpointsConfig = {
  getItemsDropdown: { query: postMutation("dropdown-list") },
  getItemsData: { query: postMutation("get-transactions") },
  createItems: { query: createMutation("") },
  deleteItems: { query: deleteMutation("delete") },
  getItemsById: { query: ({ id }: { id: number }) => getMutation(`${id}`) },

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
});export const { useGetItemsDropdownMutation, useGetItemsDataMutation, useCreateItemsMutation, useDeleteItemsMutation, useGetItemsByIdMutation } = items;
