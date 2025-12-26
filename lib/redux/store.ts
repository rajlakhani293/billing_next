import { configureStore } from '@reduxjs/toolkit';
import { auth } from '../api/auth';
import { locations } from '../api/locations';
import sessionSlice from './sessionSlice';

export const store = configureStore({
  reducer: {
    auth: auth.reducer,
    locations: locations.reducer,
    session: sessionSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([auth.middleware, locations.middleware]),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
