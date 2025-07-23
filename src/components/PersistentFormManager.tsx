import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PersistentFormManagerProps {
  formKey: string;
  formData: any;
  onLoad: (data: any) => void;
  enabled?: boolean;
  clearOnUnmount?: boolean;
}

/**
 * Hook to manage persistent form state across hot reloads and app restarts
 */
export const usePersistentForm = ({
  formKey,
  formData,
  onLoad,
  enabled = true,
  clearOnUnmount = false
}: PersistentFormManagerProps) => {
  // Load saved form state
  useEffect(() => {
    if (!enabled) return;

    const loadFormState = async () => {
      try {
        const savedFormState = await AsyncStorage.getItem(formKey);
        if (savedFormState) {
          const parsedData = JSON.parse(savedFormState);
          onLoad(parsedData);
        }
      } catch (error) {
        console.error(`Failed to load form state for ${formKey}:`, error);
      }
    };

    loadFormState();
  }, [formKey, onLoad, enabled]);

  // Save form state whenever it changes
  useEffect(() => {
    if (!enabled) return;

    const saveFormState = async () => {
      try {
        await AsyncStorage.setItem(formKey, JSON.stringify(formData));
      } catch (error) {
        console.error(`Failed to save form state for ${formKey}:`, error);
      }
    };

    saveFormState();
  }, [formKey, formData, enabled]);

  // Clean up on unmount if requested
  useEffect(() => {
    return () => {
      if (clearOnUnmount && enabled) {
        AsyncStorage.removeItem(formKey).catch(error => {
          console.error(`Failed to clear form state for ${formKey}:`, error);
        });
      }
    };
  }, [formKey, clearOnUnmount, enabled]);

  const clearForm = async () => {
    try {
      await AsyncStorage.removeItem(formKey);
    } catch (error) {
      console.error(`Failed to clear form state for ${formKey}:`, error);
    }
  };

  return { clearForm };
};
