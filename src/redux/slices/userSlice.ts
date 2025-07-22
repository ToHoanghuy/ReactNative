import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  language: 'en' | 'vi';
}

interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
}

const initialState: UserState = {
  profile: null,
  isLoading: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setUserProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
    },
    updateUserProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    changeLanguage: (state, action: PayloadAction<'en' | 'vi'>) => {
      if (state.profile) {
        state.profile.language = action.payload;
      }
    },
    clearUserProfile: (state) => {
      state.profile = null;
    },
  },
});

export const {
  setLoading,
  setUserProfile,
  updateUserProfile,
  changeLanguage,
  clearUserProfile,
} = userSlice.actions;
export default userSlice.reducer;
