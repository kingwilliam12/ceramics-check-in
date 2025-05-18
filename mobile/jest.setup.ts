import '@testing-library/jest-native/extend-expect';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

jest.mock('@react-native-community/netinfo', () => {
  return {
    addEventListener: jest.fn(() => jest.fn()),
  };
});

jest.mock('./src/api/checkIn', () => ({
  checkIn: jest.fn(() => Promise.resolve()),
}));

// Provide dummy i18n implementation
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: () => new Promise(() => {}) },
  }),
}));

// Mock Expo Location & TaskManager for background geofence tests
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestBackgroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  startLocationUpdatesAsync: jest.fn(() => Promise.resolve()),
  Accuracy: { High: 3 },
}));

jest.mock('expo-task-manager', () => ({
  defineTask: jest.fn(),
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    rpc: jest.fn(() => ({ error: null })),
  }),
}));

jest.mock('expo-constants', () => ({
  expoConfig: { extra: { supabaseUrl: 'https://example.supabase.co', supabaseAnonKey: 'anon' } },
}));

// Mock gesture-handler for tests relying on SwipeCheckIn
jest.mock('react-native-gesture-handler', () => {
  const Actual = jest.requireActual('react-native-gesture-handler');
  return {
    ...Actual,
    PanGestureHandler: ({ children }: any) => children,
    State: { END: 'END' },
  };
});
