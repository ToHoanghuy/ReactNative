import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import historySlice from './slices/historySlice';
import userSlice from './slices/userSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    history: historySlice,
    user: userSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
