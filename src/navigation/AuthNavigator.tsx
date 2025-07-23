import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParamList } from '../types/navigation';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import OTPVerificationScreen from '../screens/Auth/OTPVerificationScreen';
import SetupNewPasswordScreen from '../screens/Auth/SetupNewPasswordScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createStackNavigator<AuthStackParamList>();

const INITIAL_ROUTE_NAME_KEY = 'AUTH_NAVIGATOR_INITIAL_ROUTE';

const AuthNavigator: React.FC = () => {
  const [initialRouteName, setInitialRouteName] = useState<keyof AuthStackParamList | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Set to login by default to avoid navigation errors
    setInitialRouteName('Login');
    setIsReady(true);
    
    // We'll leave this commented out to prevent issues
    // If you want to try it again later, you can uncomment
    /*
    const loadInitialRoute = async () => {
      try {
        const savedRoute = await AsyncStorage.getItem(INITIAL_ROUTE_NAME_KEY);
        if (savedRoute && (savedRoute === 'Login' || savedRoute === 'Register' || savedRoute === 'ForgotPassword')) {
          setInitialRouteName(savedRoute as keyof AuthStackParamList);
        } else {
          setInitialRouteName('Login');
        }
      } catch (error) {
        console.error('Failed to load initial route:', error);
        setInitialRouteName('Login');
      } finally {
        setIsReady(true);
      }
    };

    loadInitialRoute();
    */
  }, []);

  // Save the current route when it changes - disabled to prevent errors
  const handleStateChange = async (state: any) => {
    // Disable state saving for now
    /*
    if (state && state.routes && state.routes.length > 0) {
      const currentRouteName = state.routes[state.index].name;
      try {
        await AsyncStorage.setItem(INITIAL_ROUTE_NAME_KEY, currentRouteName);
      } catch (error) {
        console.error('Failed to save route state:', error);
      }
    }
    */
  };

  if (!isReady) {
    // You can show a loading indicator here if needed
    return null;
  }

  return (
    <Stack.Navigator 
      initialRouteName={initialRouteName || 'Login'} 
      screenOptions={{ headerShown: false }}
      screenListeners={{
        state: (e) => {
          handleStateChange(e.data?.state);
        },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
      <Stack.Screen name="SetupNewPassword" component={SetupNewPasswordScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
