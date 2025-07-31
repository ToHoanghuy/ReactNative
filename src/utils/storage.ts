import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for storage
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  REFRESH_TOKEN: '@refresh_token',
  USER_INFO: '@user_info',
  USER_PROFILE: '@user_profile',
  HISTORY_DATA: '@history_data',
  TOKEN_EXPIRY: '@token_expiry',
};

// Save auth data
export const saveAuthData = async (token: string, user: any, profile?: any, refreshToken?: string) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(user));
    
    // Save refresh token if provided
    if (refreshToken) {
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
    
    // Save profile if provided
    if (profile) {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    }
    
    return true;
  } catch (error) {
    console.error('Error saving auth data:', error);
    return false;
  }
};

// Get auth data
export const getAuthData = async () => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const userString = await AsyncStorage.getItem(STORAGE_KEYS.USER_INFO);
    const profileString = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    
    if (!token || !userString) {
      return null;
    }
    
    return {
      token,
      refreshToken,
      user: JSON.parse(userString),
      profile: profileString ? JSON.parse(profileString) : null,
    };
  } catch (error) {
    console.error('Error getting auth data:', error);
    return null;
  }
};

// Clear auth data
export const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN, 
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_INFO,
      STORAGE_KEYS.USER_PROFILE,
      STORAGE_KEYS.TOKEN_EXPIRY,
      STORAGE_KEYS.HISTORY_DATA // Also clear history data on logout
    ]);
    return true;
  } catch (error) {
    console.error('Error clearing auth data:', error);
    return false;
  }
};

// Save history data
export const saveHistoryData = async (historyItems: any[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.HISTORY_DATA, JSON.stringify(historyItems));
    return true;
  } catch (error) {
    console.error('Error saving history data:', error);
    return false;
  }
};

// Get history data
export const getHistoryData = async () => {
  try {
    const historyString = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY_DATA);
    
    if (!historyString) {
      return [];
    }
    
    return JSON.parse(historyString);
  } catch (error) {
    console.error('Error getting history data:', error);
    return [];
  }
};

// Clear history data
export const clearHistoryData = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.HISTORY_DATA);
    return true;
  } catch (error) {
    console.error('Error clearing history data:', error);
    return false;
  }
};
