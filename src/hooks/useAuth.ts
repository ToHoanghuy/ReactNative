import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from '../redux/store';
import { login as loginAction, logout as logoutAction, updateUser as updateUserAction, updateProfile as updateProfileAction, refreshToken as refreshTokenAction } from '../redux/slices/authSlice';
import { saveAuthData, clearAuthData, STORAGE_KEYS } from '../utils/storage';
import * as authApi from '../api/authApi';
import { setupTokenRefreshTimer, clearTokenRefreshTimer } from '../api/axiosInstance';

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
  
  // New function to refresh token by calling the API
  const refreshToken = async () => {
    try {
      // Get the current refresh token from Redux state or AsyncStorage
      const currentRefreshToken = authState.refreshToken || await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      
      if (!currentRefreshToken) {
        console.error('No refresh token available');
        return { success: false, error: 'No refresh token available' };
      }
      
      // Generate a client ID (device identifier)
      const clientId = 'web-app-v1';
      
      // Call the API to refresh token
      const response = await authApi.refreshAccessToken({ refreshToken: currentRefreshToken, clientId });
      
      // Check if response is successful
      if (response.success && response.data.accessToken) {
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        // Update Redux store with new access token
        await handleRefreshToken(accessToken);
        
        // If a new refresh token is provided, update it too
        if (newRefreshToken) {
          await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
        }
        
        return { success: true, data: { accessToken, refreshToken: newRefreshToken } };
      } else {
        throw new Error(response.data?.message || 'Token refresh failed');
      }
    } catch (error: any) {
      console.error('Token refresh error:', error);
      
      // If refresh token fails, logout the user
      await handleLogout();
      
      return { success: false, error: error.message || 'An unknown error occurred' };
    }
  };  const handleLogout = async () => {
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
  };
};
