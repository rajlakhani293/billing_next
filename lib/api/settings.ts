import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQueryWithInterceptor } from "./base";
import { createMutation, deleteMutation, getMutation, postMutation, putMutation} from "./apiUtils";

const endpointsConfig = {
  getSessionData: { query: () => getMutation("session-data") },
  
}

export const settings = createApi({
  reducerPath: "settings",
  baseQuery: createBaseQueryWithInterceptor("settings"),
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
