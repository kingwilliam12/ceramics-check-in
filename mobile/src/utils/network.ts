import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';

export const checkNetworkConnection = async () => {
  const state = await NetInfo.fetch();
  return state.isConnected;
};

export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000,
): Promise<T> => {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      // Check network connection before each retry
      const isConnected = await checkNetworkConnection();
      if (!isConnected) {
        throw new Error('No network connection');
      }
      
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // If this is the last attempt, don't wait
      if (i === maxRetries - 1) break;
      
      // Wait for the specified delay before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('Operation failed after multiple attempts');
};

export const showNetworkError = (error: Error) => {
  const message = error.message.includes('network')
    ? 'Please check your internet connection and try again.'
    : error.message || 'An unexpected error occurred. Please try again.';
    
  Alert.alert('Error', message);
};
