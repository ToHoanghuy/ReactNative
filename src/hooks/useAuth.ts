import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from '../redux/store';
import { login as loginAction, logout as logoutAction, updateUser as updateUserAction, updateProfile as updateProfileAction, refreshToken as refreshTokenAction } from '../redux/slices/authSlice';
import { saveAuthData, clearAuthData, STORAGE_KEYS } from '../utils/storage';
import * as authApi from '../api/authApi';
import { setupTokenRefreshTimer, clearTokenRefreshTimer } from '../api/axiosInstance';
import { isTokenExpired, refreshTokenIfNeeded } from '../utils/tokenUtils';

export const useAuth = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth);

  const loginWithCredentials = async (email: string, password: string) => {
    try {
      // Generate a client ID (device identifier)
      const clientId = `web-app-v1`;
      
      // Call the API
      const response = await authApi.login({ email, password, clientId });
      
      // Check if response is successful
      if (response.success) {
        // Extract data from the new response structure
        const { accessToken, refreshToken, user, profile } = response.data;
        
        // Create user object with the required format for Redux
        const userData = {
          id: user._id,
          email: user.email,
          name: user.username,
          // Add additional fields from user that might be needed
          language: user.language || 'en',
          type: user.type || 'normal',
          isSubscription: user.isSubscription || false,
          role: user.role || 'user'
        };
        
        // Extract profile data if it exists
        let profileData = null;
        if (profile && profile.profile) {
          profileData = {
            height: profile.profile.height,
            weight: profile.profile.weight,
            age: profile.profile.age,
            gender: profile.profile.gender,
            smokingStatus: profile.profile.smokingStatus
          };
        }
        
        // Call the existing handler to update Redux and AsyncStorage with profile and refresh token
        await handleLoginWithProfile(accessToken, userData, profileData, refreshToken);
        
        return { success: true, data: response.data };
      } else {
        throw new Error(response.data?.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('API login error:', error);
      // Return error details for the UI to handle
      return { 
        success: false, 
        error: error.message || 'An unknown error occurred' 
      };
    }
  };

  const registerWithCredentials = async (userData: { 
    email: string; 
    password: string; 
    username: string; 
    phone: string;
    optionEmail?: string;
    invitationCode?: string;
    address?: string;
  }) => {
    try {
      // Call the API with role defaulted to 'user'
      const data = { ...userData, role: 'user' };
      const response = await authApi.register(data);
      
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        throw new Error(response.data?.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('API register error:', error);
      // Return error details for the UI to handle
      return { 
        success: false, 
        error: error.message || 'An unknown error occurred' 
      };
    }
  };

  const handleLogin = async (token: string, user: { 
    id: string; 
    email: string; 
    name: string;
    language?: string;
    type?: string;
    isSubscription?: boolean;
    role?: string;
  }, refreshToken?: string) => {
    // Dispatch action to update Redux store
    dispatch(loginAction({ token, refreshToken: refreshToken || '', user }));
    
    // Save to persistent storage
    await saveAuthData(token, user, undefined, refreshToken);
    
    // Set up automatic token refresh
    setupTokenRefreshTimer();
  };

  const handleLoginWithProfile = async (token: string, user: { 
    id: string; 
    email: string; 
    name: string;
    language?: string;
    type?: string;
    isSubscription?: boolean;
    role?: string;
  }, profile: {
    height?: number;
    weight?: number;
    age?: number;
    gender?: string;
    smokingStatus?: number;
  } | null, refreshToken?: string) => {
    // Dispatch action to update Redux store with user and profile
    dispatch(loginAction({ 
      token, 
      refreshToken: refreshToken || '', 
      user, 
      profile 
    }));
    
    // Save to persistent storage (including profile data)
    await saveAuthData(token, user, profile, refreshToken);
    
    // Set up automatic token refresh
    setupTokenRefreshTimer();
  };

  const handleRefreshToken = async (newToken: string) => {
    dispatch(refreshTokenAction({ token: newToken }));
    
    // Update token in AsyncStorage
    if (authState.user) {
      await saveAuthData(
        newToken, 
        authState.user,
        authState.profile || undefined,
        authState.refreshToken || undefined
      );
    }
    
    // Reset the automatic token refresh timer
    setupTokenRefreshTimer();
  };
  
  
  // Use the centralized refreshToken function from tokenUtils.ts
  const refreshToken = async () => {
    try {
      const result = await refreshTokenIfNeeded();
      
      if (result.success) {
        // Get the updated token
        const newToken = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (newToken) {
          // Update Redux store with new access token
          await handleRefreshToken(newToken);
        }
        
        return { success: true, data: { accessToken: newToken } };
      } else {
        // If token refresh failed with an expired token error, the tokenUtils already
        // showed the session expired modal and triggered logout events
        
        // Only if tokenUtils didn't handle the logout, we do it here
        if (result.message !== "Invalid or expired refresh token") {
          await handleLogout();
        }
        
        return { success: false, error: result.message || 'Token refresh failed' };
      }
    } catch (error: any) {
      console.error('Token refresh error in useAuth:', error);
      
      // Logout the user
      await handleLogout();
      
      return { success: false, error: error.message || 'An unknown error occurred' };
    }
  };

  const handleLogout = async () => {
    // Clear token refresh timer
    clearTokenRefreshTimer();
    
    // Clear from Redux store
    dispatch(logoutAction());
    
    // Clear from persistent storage
    await clearAuthData();
  };

  const handleUpdateUser = async (userData: Partial<{ 
    id: string; 
    email: string; 
    name: string;
    language?: string;
    type?: string;
    isSubscription?: boolean;
    role?: string;
  }>) => {
    dispatch(updateUserAction(userData));
    
    // Also update user info in AsyncStorage
    if (authState.token && authState.user) {
      const updatedUser = { ...authState.user, ...userData };
      await saveAuthData(
        authState.token, 
        updatedUser, 
        authState.profile || undefined, 
        authState.refreshToken || undefined
      );
    }
  };

  const handleUpdateProfile = async (profileData: Partial<{
    height?: number;
    weight?: number;
    age?: number;
    gender?: string;
    smokingStatus?: number;
  }>) => {
    if (profileData) {
      // Get the current profile from Redux state
      const currentProfile = authState.profile || {};
      
      // Create updated profile by merging current with new data
      const updatedProfile = { ...currentProfile, ...profileData };
      
      // Update Redux state
      dispatch(updateProfileAction(profileData));
      
      // Update AsyncStorage if we have a token and user
      if (authState.token && authState.user) {
        await saveAuthData(
          authState.token, 
          authState.user, 
          updatedProfile, 
          authState.refreshToken || undefined
        );
      }
    }
  };

  return {
    ...authState,
    login: handleLogin,
    loginWithCredentials,
    registerWithCredentials,
    logout: handleLogout,
    updateUser: handleUpdateUser,
    updateProfile: handleUpdateProfile,
    refreshToken,
    handleRefreshToken,
    isAuthenticated: authState.isLoggedIn && !!authState.token,
    refreshTokenIfNeeded: async () => refreshTokenIfNeeded(),
    isTokenExpired: async () => isTokenExpired(),
    checkTokenOnStartup: async () => {
      // Check if there's a token in storage
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) return false;
      
      // Check if token is expired
      const expired = await isTokenExpired();
      if (!expired) return true; // Token is still valid
      
      // Try to refresh the token
      console.log('Token expired on app startup, attempting to refresh');
      const result = await refreshTokenIfNeeded();
      
      if (result.success) {
        // Get user data from storage to update Redux state
        const userStr = await AsyncStorage.getItem(STORAGE_KEYS.USER_INFO);
        const profileStr = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
        const newToken = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        
        if (userStr && newToken) {
          const user = JSON.parse(userStr);
          const profile = profileStr ? JSON.parse(profileStr) : null;
          
          // Update Redux store
          dispatch(loginAction({ 
            token: newToken, 
            refreshToken: refreshToken || '', 
            user, 
            profile 
          }));
          
          return true;
        }
      }
      
      return false;
    }
  };
};
