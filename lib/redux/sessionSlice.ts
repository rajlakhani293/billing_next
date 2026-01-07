import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: number;
  name: string;
  email?: string;
  mobile_no?: string;
  role?: string;
}

interface Shop {
  id: number;
  name: string;
  legal_name?: string;
  logo_image?: string;
  website_url?: string;
  business_type_id?: number;
  tax_no?: string;
  pan_no?: string;
  address?: string;
  city?: string;
  pincode?: string;
  country_id?: number;
  state_id?: number;
}

interface Module {
  id: number;
  name: string;
  code: string;
  description?: string;
  icon?: string;
}

interface Menu {
  id: number;
  name: string;
  code: string;
  url?: string;
  icon?: string;
  parent_id?: number;
  order?: number;
  module_id?: number;
}

interface Permission {
  id: number;
  name: string;
  code: string;
  description?: string;
  module_id?: number;
}

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
  user: User | null;
  shop: Shop | null;
  menus: Menu[];
  modules: Module[];
  permissions: Permission[];
  isSessionLoaded: boolean;
}

const initialState: SessionState = {
  isUnauthorized: false,
  permissionError: null,
  sessionUpdateMessage: null,
  serverError: null,
  user: null,
  shop: null,
  menus: [],
  modules: [],
  permissions: [],
  isSessionLoaded: false,
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
    setSessionData: (state, action: PayloadAction<{
      user?: User;
      shop?: Shop;
      menus?: Menu[];
      modules?: Module[];
      permissions?: Permission[];
    }>) => {
      if (action.payload.user) state.user = action.payload.user;
      if (action.payload.shop) state.shop = action.payload.shop;
      if (action.payload.menus) state.menus = action.payload.menus;
      if (action.payload.modules) state.modules = action.payload.modules;
      if (action.payload.permissions) state.permissions = action.payload.permissions;
      state.isSessionLoaded = true;
    },
    clearSessionData: (state) => {
      state.user = null;
      state.shop = null;
      state.menus = [];
      state.modules = [];
      state.permissions = [];
      state.isSessionLoaded = false;
      state.isUnauthorized = false;
      state.permissionError = null;
      state.sessionUpdateMessage = null;
      state.serverError = null;
    },
  },
});

export const { 
  setUnauthorized, 
  setPermissionError,
  setSessionUpdate,
  setServerError,
  setSessionData,
  clearSessionData
} = sessionSlice.actions;

export default sessionSlice.reducer;