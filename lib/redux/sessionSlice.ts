import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface SessionState {
  isUnauthorized: boolean;
  permissionError: { 
    isError: boolean; 
    code: string;
    errors: any;
  } | null;
  sessionUpdateMessage: string | null;
  serverError: {
    isError: boolean;
    message: string;
    code?: number;
  } | null;
}

const initialState: SessionState = {
  isUnauthorized: false,
  permissionError: null,
  sessionUpdateMessage: null,
  serverError: null,
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setUnauthorized: (state, action: PayloadAction<boolean>) => {
      state.isUnauthorized = action.payload;
    },
    setPermissionError: (state, action: PayloadAction<SessionState['permissionError']>) => { 
      state.permissionError = action.payload; 
    },
    setSessionUpdate: (state, action: PayloadAction<string | null>) => {
      state.sessionUpdateMessage = action.payload;
    },
    setServerError: (state, action: PayloadAction<{ isError: boolean; message: string; code?: number } | null>) => {
      state.serverError = action.payload;
    },
  },
});

export const { 
  setUnauthorized, 
  setPermissionError,
  setSessionUpdate,
  setServerError
} = sessionSlice.actions;

export default sessionSlice.reducer;