import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * A custom hook that provides a way to read from and write to AsyncStorage with type safety.
 * 
 * @param key - The key under which the value is stored in AsyncStorage
 * @param initialValue - The initial value to use if no value is found in AsyncStorage
 * @returns A stateful value, and a function to update it
 */
const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => Promise<void>] => {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load the stored value from AsyncStorage when the component mounts
  useEffect(() => {
    const loadStoredValue = async () => {
      try {
        const item = await AsyncStorage.getItem(key);
        if (item !== null) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.error(`Error reading from AsyncStorage key "${key}":`, error);
        Alert.alert('Error', 'Failed to load data from storage');
      } finally {
        setIsLoaded(true);
      }
    };

    loadStoredValue();
  }, [key]);

  // Update both the state and AsyncStorage when the value changes
  const setValue = useCallback(
    async (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // Save to state
        setStoredValue(valueToStore);
        
        // Save to AsyncStorage
        await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error writing to AsyncStorage key "${key}":`, error);
        Alert.alert('Error', 'Failed to save data to storage');
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue] as const;
};

export default useLocalStorage;
