import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import historySlice from './slices/historySlice';
import userSlice from './slices/userSlice';
import accountsSlice from './slices/accountsSlice';
import packagesSlice from './slices/packagesSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    history: historySlice,
    user: userSlice,
    accounts: accountsSlice,
    packages: packagesSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
