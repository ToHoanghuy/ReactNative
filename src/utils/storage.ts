import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for storage
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  USER_INFO: '@user_info',
  HISTORY_DATA: '@history_data',
};

// Save auth data
export const saveAuthData = async (token: string, user: any) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(user));
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
    const userString = await AsyncStorage.getItem(STORAGE_KEYS.USER_INFO);
    
    if (!token || !userString) {
      return null;
    }
    
    return {
      token,
      user: JSON.parse(userString),
    };
  } catch (error) {
    console.error('Error getting auth data:', error);
    return null;
  }
};

// Clear auth data
export const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove([STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.USER_INFO]);
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
