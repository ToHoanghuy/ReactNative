import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Function to check if AsyncStorage is working properly
 * This can be called during app startup to verify AsyncStorage is initialized correctly
 */
export const checkAsyncStorage = async (): Promise<boolean> => {
  const testKey = '@test_key';
  const testValue = 'test_value';
  
  try {
    // Try to write a test value
    await AsyncStorage.setItem(testKey, testValue);
    
    // Try to read the test value
    const result = await AsyncStorage.getItem(testKey);
    
    // Clean up
    await AsyncStorage.removeItem(testKey);
    
    // Check if the read value matches what was written
    return result === testValue;
  } catch (error) {
    console.error('AsyncStorage check failed:', error);
    return false;
  }
};

/**
 * Function to clear all AsyncStorage data
 * This is useful for testing or for implementing a "Reset App" feature
 */
export const clearAllData = async (): Promise<boolean> => {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('Failed to clear AsyncStorage:', error);
    return false;
  }
};

/**
 * Function to clear navigation and form states only (not user data)
 * This is useful when hot reloading causes navigation issues
 */
export const clearNavigationStates = async (): Promise<boolean> => {
  try {
    // Get all keys
    const keys = await AsyncStorage.getAllKeys();
    
    // Filter for navigation-related keys
    const navigationKeys = keys.filter(key => 
      key.includes('NAVIGATION') || 
      key.includes('ROUTE') || 
      key.includes('FORM_STATE')
    );
    
    // Remove them
    if (navigationKeys.length > 0) {
      await AsyncStorage.multiRemove(navigationKeys);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to clear navigation states:', error);
    return false;
  }
};

// Helper to get AsyncStorage size information (only works on certain platforms)
export const getStorageSize = async (): Promise<{ keys: number; estimatedSize: string } | null> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    let totalSize = 0;
    
    // This is an estimation and will be relatively slow with many items
    for (const key of keys) {
      const item = await AsyncStorage.getItem(key);
      if (item) {
        totalSize += item.length * 2; // Rough estimate, 2 bytes per character
      }
    }
    
    const sizeInKB = totalSize / 1024;
    const sizeText = sizeInKB < 1024 
      ? `${sizeInKB.toFixed(2)} KB` 
      : `${(sizeInKB / 1024).toFixed(2)} MB`;
    
    return {
      keys: keys.length,
      estimatedSize: sizeText
    };
  } catch (error) {
    console.error('Failed to get storage size:', error);
    return null;
  }
};
