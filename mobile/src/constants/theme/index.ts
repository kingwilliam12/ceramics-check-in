import { Dimensions, Platform, PixelRatio } from 'react-native';

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

// Based on iPhone 13 Pro scale
const scale = SCREEN_WIDTH / 390;

export const normalize = (size: number): number => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export const Colors = {
  // Primary colors
  primary: '#4A6FA5',
  primaryLight: '#7A9DCC',
  primaryDark: '#1C467B',
  
  // Secondary colors
  secondary: '#FFA630',
  secondaryLight: '#FFD166',
  secondaryDark: '#E67E22',
  
  // Status colors
  success: '#4CAF50',
  info: '#2196F3',
  warning: '#FFC107',
  error: '#F44336',
  
  // Grayscale
  white: '#FFFFFF',
  lightGray: '#F5F5F5',
  mediumGray: '#E0E0E0',
  gray: '#9E9E9E',
  darkGray: '#424242',
  black: '#000000',
  
  // Backgrounds
  background: '#F8F9FA',
  surface: '#FFFFFF',
  
  // Text
  text: '#212121',
  textSecondary: '#757575',
  textDisabled: '#BDBDBD',
  textInverse: '#FFFFFF',
  
  // Borders
  border: '#E0E0E0',
  divider: '#EEEEEE',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;

export const Fonts = {
  // Font families
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
  
  // Font sizes
  h1: normalize(32),
  h2: normalize(28),
  h3: normalize(24),
  h4: normalize(20),
  h5: normalize(18),
  h6: normalize(16),
  body1: normalize(16),
  body2: normalize(14),
  caption: normalize(12),
  overline: normalize(10),
  
  // Line heights
  lineHeightH1: normalize(40),
  lineHeightH2: normalize(36),
  lineHeightH3: normalize(32),
  lineHeightH4: normalize(28),
  lineHeightH5: normalize(24),
  lineHeightH6: normalize(22),
  lineHeightBody1: normalize(24),
  lineHeightBody2: normalize(20),
  lineHeightCaption: normalize(16),
  lineHeightOverline: normalize(14),
} as const;

export const Spacing = {
  none: 0,
  xxs: normalize(2),
  xs: normalize(4),
  sm: normalize(8),
  md: normalize(16),
  lg: normalize(24),
  xl: normalize(32),
  xxl: normalize(48),
  xxxl: normalize(64),
} as const;

export const BorderRadius = {
  none: 0,
  xs: normalize(2),
  sm: normalize(4),
  md: normalize(8),
  lg: normalize(12),
  xl: normalize(16),
  pill: 9999,
  circle: 9999,
} as const;

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
} as const;

export const Animation = {
  duration: {
    fastest: 100,
    faster: 200,
    fast: 300,
    normal: 500,
    slow: 800,
    slower: 1000,
    slowest: 1500,
  },
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
} as const;

export const ZIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

export const Breakpoints = {
  xs: 0, // Extra small devices (portrait phones, less than 576px)
  sm: 576, // Small devices (landscape phones, 576px and up)
  md: 768, // Medium devices (tablets, 768px and up)
  lg: 992, // Large devices (desktops, 992px and up)
  xl: 1200, // Extra large devices (large desktops, 1200px and up)
  xxl: 1400, // Extra extra large devices (larger desktops, 1400px and up)
} as const;

export const Theme = {
  colors: Colors,
  fonts: Fonts,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
  animation: Animation,
  zIndex: ZIndex,
  breakpoints: Breakpoints,
  isIOS,
  isAndroid,
  normalize,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
} as const;

export type ThemeType = typeof Theme;
