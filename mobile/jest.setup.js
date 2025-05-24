import '@testing-library/jest-native/extend-expect';
import { jest } from '@jest/globals';

// Mock React Native's Animated
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock React Native Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  
  // Mock any Reanimated functions you use
  Reanimated.default.call = () => {};
  
  return Reanimated;
});

// Mock React Native Gesture Handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    GestureHandlerRootView: View,
    Directions: {},
  };
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Supabase
jest.mock('@supabase/supabase-js', () => {
  return {
    createClient: jest.fn(() => ({
      auth: {
        signIn: jest.fn(),
        signOut: jest.fn(),
        signUp: jest.fn(),
        resetPasswordForEmail: jest.fn(),
        updateUser: jest.fn(),
        onAuthStateChange: jest.fn(),
        session: null,
        user: null,
      },
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      })),
    })),
  };
});

// Mock environment variables
jest.mock('@env', () => ({
  EXPO_PUBLIC_SUPABASE_URL: 'mock-supabase-url',
  EXPO_PUBLIC_SUPABASE_ANON_KEY: 'mock-supabase-anon-key',
  EXPO_PUBLIC_APP_ENV: 'test',
  EXPO_PUBLIC_API_URL: 'http://localhost:3000',
}));

// Mock any other native modules as needed
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Add any global test setup here
beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
  
  // Add any other global test setup
});

afterEach(() => {
  // Clean up after each test
});

// Mock any global functions or objects
// For example, to mock the console.error to fail tests on console.error
const originalConsoleError = console.error;
console.error = (message, ...args) => {
  originalConsoleError(message, ...args);
  throw message instanceof Error ? message : new Error(message);
};
