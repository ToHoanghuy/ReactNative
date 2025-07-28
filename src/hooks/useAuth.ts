import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { login as loginAction, logout as logoutAction, updateUser as updateUserAction } from '../redux/slices/authSlice';
import { saveAuthData, clearAuthData } from '../utils/storage';
import * as authApi from '../api/authApi';

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
        
        // Call the existing handler to update Redux and AsyncStorage
        await handleLogin(accessToken, userData);
        
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
  }) => {
    // Dispatch action to update Redux store
    dispatch(loginAction({ token, user }));
    
    // Save to persistent storage
    await saveAuthData(token, user);
  };

  const handleLogout = async () => {
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
      await saveAuthData(authState.token, updatedUser);
    }
  };

  return {
    ...authState,
    login: handleLogin,
    loginWithCredentials,
    registerWithCredentials,
    logout: handleLogout,
    updateUser: handleUpdateUser,
    isAuthenticated: authState.isLoggedIn && !!authState.token,
  };
};
