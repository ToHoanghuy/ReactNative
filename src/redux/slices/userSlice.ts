import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  language: 'en' | 'vn';
  emailNotificationsEnabled?: boolean;
}

interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
}

const initialState: UserState = {
  profile: {
    id: '',
    name: '',
    email: '',
    language: 'vi' as 'en' | 'vn',
    emailNotificationsEnabled: false,
  },
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
    changeLanguage: (state, action: PayloadAction<'en' | 'vn'>) => {
      if (state.profile) {
        state.profile.language = action.payload;
      } else {
        // Nếu profile chưa có, tạo profile mặc định với ngôn ngữ được chọn
        state.profile = {
          id: '',
          name: '',
          email: '',
          language: action.payload,
        };
      }
    },
    clearUserProfile: (state) => {
      state.profile = null;
    },
    updateNotificationSettings: (state, action: PayloadAction<boolean>) => {
      if (state.profile) {
        state.profile.emailNotificationsEnabled = action.payload;
      }
    },
  },
});

export const {
  setLoading,
  setUserProfile,
  updateUserProfile,
  changeLanguage,
  clearUserProfile,
  updateNotificationSettings,
} = userSlice.actions;
export default userSlice.reducer;
