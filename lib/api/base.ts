import { fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { setUnauthorized, setServerError, setPermissionError } from '../redux/sessionSlice'; 
import { prepareHeadersWithToken } from './apiUtils';
import toast from 'react-hot-toast';


interface BackendError {
  success: boolean;
  code: string;       
  errors?: any;       
}

const actualBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_API_URL || 'http://127.0.0.1:8000/', 
  prepareHeaders: prepareHeadersWithToken,
});

export const createBaseQueryWithInterceptor = (
  reducerPath: string
): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> => {
  return async (args, api, extraOptions) => {
    
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
          const errorMessage = data?.errors?.message || 
            (code === 'SERVICE_UNAVAILABLE' ? 'Service temporarily unavailable. Please try again later.' : 
             code === 'DATABASE_ERROR' ? 'Database connection error. Please try again.' :
             'Something went wrong on our servers. We are already working to fix this.');
          
          // Show toast notification immediately
          toast.error(errorMessage, {
            duration: 5000,
            position: 'top-center'
          });
          
          // Also update Redux state for any components that might need it
          api.dispatch(setServerError({
            isError: true,
            code: 500,
            message: errorMessage
          }));
      }
    }

    return result;
  };
};
