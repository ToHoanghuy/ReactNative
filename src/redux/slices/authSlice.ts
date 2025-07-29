import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
  refreshToken: string | null;
  user: {
    id: string;
    email: string;
    name: string;
    language?: string;
    type?: string;
    isSubscription?: boolean;
    role?: string;
  } | null;
  profile: {
    height?: number;
    weight?: number;
    age?: number;
    gender?: string;
    smokingStatus?: number;
  } | null;
}

const initialState: AuthState = {
  isLoggedIn: false,
  token: null,
  refreshToken: null,
  user: null,
  profile: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ 
      token: string; 
      refreshToken: string;
      user: AuthState['user']; 
      profile?: AuthState['profile'] 
    }>) => {
      state.isLoggedIn = true;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      state.profile = action.payload.profile || null;
    },
    refreshToken: (state, action: PayloadAction<{ token: string }>) => {
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.profile = null;
    },
    updateUser: (state, action: PayloadAction<Partial<AuthState['user']>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    updateProfile: (state, action: PayloadAction<Partial<AuthState['profile']>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      } else {
        state.profile = action.payload as AuthState['profile'];
      }
    },
  },
});

export const { login, logout, updateUser, updateProfile, refreshToken } = authSlice.actions;
export default authSlice.reducer;
