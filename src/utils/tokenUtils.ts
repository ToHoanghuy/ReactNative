import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './storage';
import * as authApi from '../api/authApi';

/**
 * Check if the current access token is expired
 * @returns {Promise<boolean>} True if token is expired or not found, false otherwise
 */
export const isTokenExpired = async (): Promise<boolean> => {
  // First check if token exists
  const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  if (!token) return true;
  
  // Then check expiry timestamp
  const expiresAtStr = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
  if (!expiresAtStr) return true;

  const expiresAt = Number(expiresAtStr);
  // Add a 5-second buffer to avoid edge cases
  return Date.now() >= (expiresAt - 5000);
};

/**
 * Check if we have a valid refresh token
 * @returns {Promise<boolean>} True if a refresh token exists, false otherwise
 */
export const hasRefreshToken = async (): Promise<boolean> => {
  const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  return !!refreshToken;
};

/**
 * Refresh the access token if needed (if it's expired and we have a refresh token)
 * @returns {Promise<{success: boolean, message?: string}>} Result of the refresh operation
 */
export const refreshTokenIfNeeded = async (): Promise<{success: boolean, message?: string}> => {
  try {
    // First check if token is expired
    const isExpired = await isTokenExpired();
    if (!isExpired) {
      return { success: true, message: 'Token still valid' };
    }
    
    // Then check if we have a refresh token
    const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) {
      return { success: false, message: 'No refresh token available' };
    }
    
    console.log('Token expired, attempting to refresh');
    
    // Call the API to refresh the token
    const clientId = 'web-app-v1';
    const response = await authApi.refreshAccessToken({ refreshToken, clientId });
    
    console.log('Refresh token response:', response);
    
    if (response.success) {
      // Handle different response formats - API might return accessToken or access_token
      const accessToken = response.data.accessToken || response.data.access_token;
      const newRefreshToken = response.data.refreshToken || response.data.refresh_token;
      
      if (!accessToken) {
        console.error('No access token in response', response);
        return { success: false, message: 'No access token in response' };
      }
      
      // Save the new access token
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);
      
      // If a new refresh token is provided, update it too
      if (newRefreshToken) {
        await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
      }
      
      // Update token expiry time (15 minutes from now)
      const expiryTime = Date.now() + (15 * 60 * 1000);
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());
      
      console.log('Token refreshed successfully');
      return { success: true, message: 'Token refreshed successfully' };
    } else {
      console.error('Failed to refresh token:', response.message);
      
      // Check if refresh token is expired or invalid
      if (response.message === "Invalid or expired refresh token") {
        // Import EventRegister dynamically to avoid circular dependencies
        const { EventRegister } = require('react-native-event-listeners');
        
        // Emit event to show session expired modal
        try {
          EventRegister.emit('SESSION_EXPIRED', { 
            message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' 
          });
        } catch (e) {
          console.error('Failed to emit SESSION_EXPIRED event:', e);
        }
        
        // Clear all auth data
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.AUTH_TOKEN,
          STORAGE_KEYS.REFRESH_TOKEN,
          STORAGE_KEYS.USER_INFO,
          STORAGE_KEYS.USER_PROFILE,
          STORAGE_KEYS.TOKEN_EXPIRY
        ]);
        
        // Emit logout event to force navigation to login screen
        try {
          EventRegister.emit('AUTH_LOGOUT', { 
            reason: 'expired_token',
            message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
          });
        } catch (e) {
          console.error('Failed to emit AUTH_LOGOUT event:', e);
        }
      }
      
      return { success: false, message: response.message || 'Failed to refresh token' };
    }
  } catch (error: any) {
    console.error('Error refreshing token:', error);
    return { success: false, message: error.message || 'An unknown error occurred' };
  }
};
