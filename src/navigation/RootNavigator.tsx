import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { RootStackParamList } from '../types/navigation';
import { login } from '../redux/slices/authSlice';
import AuthNavigator from './AuthNavigator';
import BottomTabNavigator from './BottomTabNavigator';
import ResultDetailScreen from '../screens/Scan/ResultDetailScreen';
import { getAuthData } from '../utils/storage';
import SplashScreen from '../components/SplashScreen';
import { AppState, Platform } from 'react-native';
import { clearNavigationStates } from '../utils/asyncStorageSetup';
import { refreshTokenIfNeeded } from '../utils/tokenUtils';

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const [isLoading, setIsLoading] = useState(true);
  // Add a key to force re-render on hot reload if needed
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Clear navigation states to prevent issues with hot reload
        await clearNavigationStates();
        
        // Check if token needs to be refreshed
        console.log('Checking if token needs refreshing in RootNavigator');
        const refreshResult = await refreshTokenIfNeeded();
        console.log('Token refresh result in RootNavigator:', refreshResult);
        
        const authData = await getAuthData();
        
        if (authData && authData.token && authData.user) {
          // Restore auth state from storage
          dispatch(login({ 
            token: authData.token, 
            refreshToken: authData.refreshToken ?? '', 
            user: authData.user,
            profile: authData.profile
          }));
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Listen for app state changes to handle hot reload
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        // This helps when coming back from hot reload
        // Force re-render the navigation stack
        setReloadKey(prev => prev + 1);
      }
    });

    checkAuth();
    
    // Clean up subscription
    return () => {
      subscription.remove();
    };
  }, [dispatch]);

  // Force a re-render when needed with this key
  return (
    <>
      <Stack.Navigator key={reloadKey} screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <>
            <Stack.Screen name="Main" component={BottomTabNavigator} />
            {/* <Stack.Screen name="ResultDetail" component={ResultDetailScreen} /> */}
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
      
      {/* SplashScreen as overlay when loading */}
      {/* {isLoading && <SplashScreen isLoading={isLoading} />} */}
    </>
  );
};

export default RootNavigator;
