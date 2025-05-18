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
