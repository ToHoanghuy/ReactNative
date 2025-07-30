// src/api/axiosInstance.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/storage';
import { EventRegister } from 'react-native-event-listeners';

// Track if we're currently refreshing the token to avoid multiple refreshes
let isRefreshingToken = false;
// Queue of requests to retry after token refresh
let refreshSubscribers: Array<(token: string) => void> = [];
// Store the token expiry timestamp
let tokenExpiryTimestamp: number | null = null;
// Timer for automatic token refresh (15 minutes = 900000 ms)
const TOKEN_REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes in milliseconds
let tokenRefreshTimer: ReturnType<typeof setTimeout> | null = null;

// Function to add request to the queue
const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Function to retry all queued requests with new token
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

// Function to set up automatic token refresh
const setupTokenRefreshTimer = async () => {
  // Clear any existing timer
  if (tokenRefreshTimer) {
    clearTimeout(tokenRefreshTimer);
    tokenRefreshTimer = null;
  }
  
  // Set current time + interval as expiry time
  tokenExpiryTimestamp = Date.now() + TOKEN_REFRESH_INTERVAL;
  
  // Save expiry timestamp to AsyncStorage for persistence across app restarts
  await AsyncStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, tokenExpiryTimestamp.toString());
  
  // Set up timer for token refresh
  tokenRefreshTimer = setTimeout(async () => {
    try {
      // Don't refresh if we're already in the process
      if (isRefreshingToken) return;
      
      // Get refresh token
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) return;
      
      console.log('Automatic token refresh after 15 minutes');
      
      // Import dynamically to avoid circular dependency
      const { refreshAccessToken } = require('./authApi');
      const response = await refreshAccessToken({
        refreshToken,
        clientId: 'web-app-v1'
      });
      
      console.log('Automatic token refresh response:', response);
      
      if (response.success && (response.data.accessToken || response.data.access_token)) {
        const newToken = response.data.accessToken || response.data.access_token;
        
        // Save the new token
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken);
        
        // If refresh token also returned, update it
        if (response.data.refreshToken || response.data.refresh_token) {
          const newRefreshToken = response.data.refreshToken || response.data.refresh_token;
          await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
        }
        
        // Emit silent refresh event (no modal needed for automatic refresh)
        try {
          EventRegister.emit('TOKEN_SILENT_REFRESH', { newToken });
        } catch (e) {
          console.log('Failed to emit TOKEN_SILENT_REFRESH event:', e);
        }
        
        // Setup next refresh timer
        setupTokenRefreshTimer();
      }
    } catch (error) {
      console.error('Automatic token refresh failed:', error);
      // If automatic refresh fails, we'll wait for the next API call to trigger a regular refresh
    }
  }, TOKEN_REFRESH_INTERVAL);
};

// Function to clear token refresh timer
const clearTokenRefreshTimer = () => {
  if (tokenRefreshTimer) {
    clearTimeout(tokenRefreshTimer);
    tokenRefreshTimer = null;
  }
  tokenExpiryTimestamp = null;
  // Remove from AsyncStorage
  AsyncStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
};

const axiosInstance = axios.create({
  baseURL: 'https://jbaai.onrender.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add auth token to every request
axiosInstance.interceptors.request.use(
  async (config) => {
    // Try to get the token from AsyncStorage
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    
    // If token exists, add it to the request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      
      // Check if we need to set up the token refresh timer
      if (!tokenRefreshTimer) {
        // Try to get existing expiry from AsyncStorage
        const expiryStr = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
        const expiry = expiryStr ? parseInt(expiryStr) : null;
        
        // If no expiry or expiry is in the past, set up a new timer
        if (!expiry || expiry < Date.now()) {
          setupTokenRefreshTimer();
        } else {
          // Calculate remaining time until refresh
          const remainingTime = expiry - Date.now();
          
          // If less than 1 minute remains, refresh now, otherwise set timer for remaining time
          if (remainingTime < 60000) {
            setupTokenRefreshTimer();
          } else {
            // Set timer for remaining time
            tokenRefreshTimer = setTimeout(() => {
              setupTokenRefreshTimer();
            }, remainingTime);
          }
        }
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common error cases
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors (token expired, etc.)
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // Avoid retrying already retried requests
      originalRequest._retry = true;
      
      // If we're not already refreshing the token
      if (!isRefreshingToken) {
        isRefreshingToken = true;
        
        try {
          // Get the refresh token
          const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
          
          if (!refreshToken) {
            // No refresh token available, logout user (implement a global event mechanism for this)
            console.log('No refresh token available - user needs to login again');
            throw new Error('Authentication required');
          }
          
          // Import dynamically to avoid circular dependency
          const { refreshAccessToken } = require('./authApi');
          const response = await refreshAccessToken({ 
            refreshToken, 
            clientId: 'web-app-v1' 
          });
          
          console.log('Token refresh response in interceptor:', response);
          
          if (response.success && (response.data.accessToken || response.data.access_token)) {
            const newToken = response.data.accessToken || response.data.access_token;
            
            // Save the new token
            await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken);
            
            // If refresh token also returned, update it
            if (response.data.refreshToken || response.data.refresh_token) {
              const newRefreshToken = response.data.refreshToken || response.data.refresh_token;
              await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
            }
            
            // Set up automatic token refresh timer
            setupTokenRefreshTimer();
            
            // Update the authorization header for the original request
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            
            // Emit event to show token refresh modal
            try {
              EventRegister.emit('TOKEN_REFRESHED', { newToken });
            } catch (e) {
              console.log('Failed to emit TOKEN_REFRESHED event:', e);
            }
            
            // Notify subscribers with new token
            onRefreshed(newToken);
            
            // Return the modified request
            return axiosInstance(originalRequest);
          } else {
            // Refresh token invalid or expired, force logout
            console.log('Refresh token failed - user needs to login again');
            // Clean up tokens
            await AsyncStorage.multiRemove([
              STORAGE_KEYS.AUTH_TOKEN, 
              STORAGE_KEYS.REFRESH_TOKEN, 
              STORAGE_KEYS.USER_INFO,
              STORAGE_KEYS.USER_PROFILE,
              STORAGE_KEYS.TOKEN_EXPIRY
            ]);
            
            // Clear token refresh timer
            clearTokenRefreshTimer();
            
            // Use global event system to notify app about logout
            try {
              // First emit a TOKEN_REFRESH_FAILED event to show the modal
              EventRegister.emit('TOKEN_REFRESH_FAILED', { reason: 'token_expired' });
              // The AUTH_LOGOUT event will be triggered after user clicks OK on modal
            } catch (e) {
              console.log('Failed to emit TOKEN_REFRESH_FAILED event:', e);
              // Fallback: directly emit AUTH_LOGOUT if emitting TOKEN_REFRESH_FAILED fails
              EventRegister.emit('AUTH_LOGOUT', { reason: 'token_expired' });
            }
            throw new Error('Authentication required');
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // Clear token refresh timer
          clearTokenRefreshTimer();
          // Force logout here after showing the modal
          try {
            // Show failure modal first
            EventRegister.emit('TOKEN_REFRESH_FAILED', { reason: 'refresh_error' });
            // The AUTH_LOGOUT event will be triggered after user clicks OK on modal
          } catch (e) {
            console.log('Failed to emit TOKEN_REFRESH_FAILED event:', e);
            // Fallback: directly emit AUTH_LOGOUT
            EventRegister.emit('AUTH_LOGOUT', { reason: 'refresh_error' });
          }
          throw refreshError;
        } finally {
          isRefreshingToken = false;
        }
      } else {
        // If we're already refreshing, add this request to the queue
        return new Promise(resolve => {
          addRefreshSubscriber(token => {
            // Replace the expired token
            originalRequest.headers.Authorization = `Bearer ${token}`;
            // Retry the request
            resolve(axiosInstance(originalRequest));
          });
        });
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;

// Export utility functions for token management
export { setupTokenRefreshTimer, clearTokenRefreshTimer };
