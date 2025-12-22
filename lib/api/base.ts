import { fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { setUnauthorized, setServerError, setPermissionError } from '@/redux/sessionSlice'; 
import { prepareHeadersWithToken } from './apiUtils';

interface BackendError {
  success: boolean;
  code: string;       
  errors?: any;       
}

const actualBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_API_URL, 
  prepareHeaders: prepareHeadersWithToken,
});

export const createBaseQueryWithInterceptor = (
  reducerPath: string
): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> => {
  return async (args: string | FetchArgs, api: any, extraOptions: any) => {
    
    let modifiedArgs = args;

    if (typeof args === 'string') {
      modifiedArgs = `${reducerPath}/${args}`;
    } else if (args && typeof args === 'object' && 'url' in args) {
      modifiedArgs = { ...args, url: `${reducerPath}/${args.url}` };
    }

    const result = await actualBaseQuery(modifiedArgs, api, extraOptions);

    if (result.error) {
      const data = result.error.data as BackendError;
      
      const code = data?.code || 'UNKNOWN_ERROR';

      // Auth & Session Errors
      if (code === 'UNAUTHORIZED' || code === 'TOKEN_EXPIRED' || code === 'SESSION_EXPIRED') {
          api.dispatch(setUnauthorized(true));
      }

      // Permission / Forbidden Errors
      else if (code === 'FORBIDDEN' || code === 'PERMISSION_DENIED' || code === 'SUBSCRIPTION_PLAN_LIMIT_REACHED') {
          api.dispatch(setPermissionError({ 
            isError: true, 
            code: code, 
            errors: data?.errors || null 
          }));
      }

      // Server / Database Errors (500+)
      else if (code === 'SERVER_ERROR' || code === 'DATABASE_ERROR' || code === 'SERVICE_UNAVAILABLE') {
          api.dispatch(setServerError({
            isError: true,
            code: 500,
            message: ''
          }));
      }
    }

    return result;
  };
};
