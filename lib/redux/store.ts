import { configureStore } from '@reduxjs/toolkit';
import { auth } from '../api/auth';
import sessionSlice from './sessionSlice';

export const store = configureStore({
  reducer: {
    auth: auth.reducer,
    session: sessionSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(auth.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
