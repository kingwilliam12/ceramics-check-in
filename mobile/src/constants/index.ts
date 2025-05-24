export * from './theme';

export const APP_NAME = 'D&D Check-In';
export const APP_DESCRIPTION = 'A modern check-in app for Dungeons & Dragons sessions';
export const APP_VERSION = '1.0.0';

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  REFRESH_TOKEN: '@refresh_token',
  USER_DATA: '@user_data',
  THEME_PREFERENCE: '@theme_preference',
  LANGUAGE_PREFERENCE: '@language_preference',
  NOTIFICATION_PREFERENCES: '@notification_preferences',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    CHANGE_PASSWORD: '/user/change-password',
    UPLOAD_AVATAR: '/user/upload-avatar',
  },
  SESSIONS: {
    BASE: '/sessions',
    BY_ID: (id: string) => `/sessions/${id}`,
    JOIN: (id: string) => `/sessions/${id}/join`,
    LEAVE: (id: string) => `/sessions/${id}/leave`,
    CHECK_IN: (id: string) => `/sessions/${id}/check-in`,
    CHECK_OUT: (id: string) => `/sessions/${id}/check-out`,
  },
  CHARACTERS: {
    BASE: '/characters',
    BY_ID: (id: string) => `/characters/${id}`,
    MY_CHARACTERS: '/characters/me',
  },
  CAMPAIGNS: {
    BASE: '/campaigns',
    BY_ID: (id: string) => `/campaigns/${id}`,
    MY_CAMPAIGNS: '/campaigns/me',
    JOIN: (id: string) => `/campaigns/${id}/join`,
    LEAVE: (id: string) => `/campaigns/${id}/leave`,
  },
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unknown error occurred. Please try again.',
  INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
  USERNAME_ALREADY_EXISTS: 'This username is already taken.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PASSWORD: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.',
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match.',
  INVALID_TOKEN: 'Invalid or expired token. Please try again.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
} as const;

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in.',
  LOGOUT_SUCCESS: 'Successfully logged out.',
  REGISTER_SUCCESS: 'Account created successfully. Please check your email to verify your account.',
  PASSWORD_RESET_EMAIL_SENT: 'If an account exists with this email, you will receive a password reset link.',
  PASSWORD_RESET_SUCCESS: 'Your password has been reset successfully. You can now log in with your new password.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  PASSWORD_CHANGED: 'Password changed successfully.',
  AVATAR_UPDATED: 'Profile picture updated successfully.',
  SESSION_CREATED: 'Session created successfully.',
  SESSION_UPDATED: 'Session updated successfully.',
  SESSION_DELETED: 'Session deleted successfully.',
  CHARACTER_CREATED: 'Character created successfully.',
  CHARACTER_UPDATED: 'Character updated successfully.',
  CHARACTER_DELETED: 'Character deleted successfully.',
  CAMPAIGN_CREATED: 'Campaign created successfully.',
  CAMPAIGN_UPDATED: 'Campaign updated successfully.',
  CAMPAIGN_DELETED: 'Campaign deleted successfully.',
} as const;

export const VALIDATION_RULES = {
  EMAIL: {
    required: 'Email is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Invalid email address',
    },
  },
  PASSWORD: {
    required: 'Password is required',
    minLength: {
      value: 8,
      message: 'Password must be at least 8 characters long',
    },
    validate: {
      hasUppercase: (value: string) =>
        /[A-Z]/.test(value) || 'Password must contain at least one uppercase letter',
      hasLowercase: (value: string) =>
        /[a-z]/.test(value) || 'Password must contain at least one lowercase letter',
      hasNumber: (value: string) =>
        /[0-9]/.test(value) || 'Password must contain at least one number',
    },
  },
  USERNAME: {
    required: 'Username is required',
    minLength: {
      value: 3,
      message: 'Username must be at least 3 characters long',
    },
    maxLength: {
      value: 30,
      message: 'Username must be less than 30 characters',
    },
    pattern: {
      value: /^[a-zA-Z0-9_]+$/,
      message: 'Username can only contain letters, numbers, and underscores',
    },
  },
  DISPLAY_NAME: {
    required: 'Display name is required',
    minLength: {
      value: 2,
      message: 'Display name must be at least 2 characters long',
    },
    maxLength: {
      value: 50,
      message: 'Display name must be less than 50 characters',
    },
  },
} as const;
