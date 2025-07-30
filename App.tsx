import React, { useRef, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import DataProvider from './src/components/DataProvider';
import RootNavigator from './src/navigation/RootNavigator';
import { LogBox } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventRegister } from 'react-native-event-listeners';
import TokenRefreshModal from './src/components/TokenRefreshModal';
import SessionExpiredModal from './src/components/SessionExpiredModal';
import { STORAGE_KEYS } from './src/utils/storage';
import { setupTokenRefreshTimer } from './src/api/axiosInstance';
import { refreshTokenIfNeeded } from './src/utils/tokenUtils';

if (__DEV__) require('react-native-devsettings');
// Ignore specific warnings
LogBox.ignoreLogs([
  'Got a component with the name',
  'i18next::pluralResolver'
]);

const App: React.FC = () => {
  const navigationRef = useRef(null);
  const [appKey, setAppKey] = useState(Date.now());

  // Navigation state persistence
  const PERSISTENCE_KEY = 'NAVIGATION_STATE_V1';

  // Setup app reload mechanism
  useEffect(() => {
    // Listen for the authentication logout event
    const authLogoutListener = EventRegister.addEventListener('AUTH_LOGOUT', (data: { reason: string }) => {
      console.log('Authentication logout event received:', data);
      // Reload the app by changing the key
      setAppKey(Date.now());
    });
    
    // Initialize the token refresh timer if a token exists
    const initializeTokenRefresh = async () => {
      try {
        console.log('Checking token status on app start');
        
        // Get token utility functions without using hooks
        const tokenUtils = require('./src/utils/tokenUtils');
        
        // Check if there's a token in storage
        const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (!token) {
          console.log('No token found, skipping refresh');
          return;
        }
        
        // Check if token is expired
        const expired = await tokenUtils.isTokenExpired();
        if (!expired) {
          console.log('Token is still valid, setting up refresh timer');
          setupTokenRefreshTimer();
          return;
        }
        
        // Token is expired, try to refresh
        console.log('Token expired on app startup, attempting to refresh');
        const result = await tokenUtils.refreshTokenIfNeeded();
        
        if (result.success) {
          console.log('Token successfully refreshed on app start');
          
          // Get user data from storage to update Redux store
          const userStr = await AsyncStorage.getItem(STORAGE_KEYS.USER_INFO);
          const profileStr = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
          const newToken = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
          const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
          
          if (userStr && newToken) {
            // Redux store will be updated by DataProvider component
            console.log('User data restored after token refresh');
          }
        } else {
          console.log('Token refresh failed on app start:', result.message);
          // Show session expired modal or handle in the DataProvider
          if (result.message === "Invalid or expired refresh token") {
            EventRegister.emit('SESSION_EXPIRED', { message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' });
          }
        }
      } catch (error) {
        console.error('Error during app initialization token refresh:', error);
      }
    };
    
    initializeTokenRefresh();
    
    // Cleanup listener on unmount
    return () => {
      EventRegister.removeEventListener(authLogoutListener as string);
    };
  }, []);

  return (
    <Provider store={store} key={appKey}>
      <DataProvider>
        <NavigationContainer
          ref={navigationRef}
          onStateChange={(state) => {
            // Disable saving navigation state to prevent issues
            // We'll rely on individual screen-level persistence instead
            // This helps avoid RESET action errors
          }}
          onReady={() => {
            // Reset navigation state instead of trying to restore it
            // This prevents 'RESET' action errors when navigation structure changes
            try {
              // Just clear the saved state to avoid future errors
              AsyncStorage.removeItem(PERSISTENCE_KEY);
            } catch (e) {
              console.warn('Failed to clear navigation state', e);
            }
          }}
        >
          <RootNavigator />
          <TokenRefreshModal />
          <SessionExpiredModal />
        </NavigationContainer>
      </DataProvider>
    </Provider>
  );
};

export default App;
