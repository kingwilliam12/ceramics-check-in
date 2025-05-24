import React from 'react';
import { View, StyleSheet, ActivityIndicator, ViewStyle, StyleProp } from 'react-native';
import { Theme } from '@constants/theme';
import Text from '../Text';

type LoadingSize = 'small' | 'medium' | 'large' | number;
type LoadingVariant = 'default' | 'primary' | 'secondary' | 'light' | 'dark' | 'inverted';

interface LoadingProps {
  /**
   * The size of the loading indicator
   * @default 'medium'
   */
  size?: LoadingSize;
  /**
   * The variant of the loading indicator
   * @default 'primary'
   */
  variant?: LoadingVariant;
  /**
   * The text to display below the loading indicator
   */
  text?: string;
  /**
   * Whether to show the loading text
   * @default true
   */
  showText?: boolean;
  /**
   * Whether the loading indicator should take up the full screen
   * @default false
   */
  fullScreen?: boolean;
  /**
   * Whether the loading indicator should be centered in its container
   * @default true
   */
  center?: boolean;
  /**
   * Custom styles for the container
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Custom styles for the loading text
   */
  textStyle?: StyleProp<ViewStyle>;
  /**
   * Custom color for the loading indicator
   */
  color?: string;
}

/**
 * A customizable loading indicator component with different sizes and variants.
 */
const Loading: React.FC<LoadingProps> = ({
  size = 'medium',
  variant = 'primary',
  text = 'Loading...',
  showText = true,
  fullScreen = false,
  center = true,
  style,
  textStyle,
  color: customColor,
}) => {
  // Get the size value based on the size prop
  const getSize = (): number => {
    if (typeof size === 'number') return size;
    
    const sizeMap: Record<string, number> = {
      small: 20,
      medium: 30,
      large: 40,
    };
    
    return sizeMap[size] || 30;
  };

  // Get the color based on the variant
  const getColor = (): string => {
    if (customColor) return customColor;
    
    const colorMap: Record<LoadingVariant, string> = {
      default: Theme.colors.primary,
      primary: Theme.colors.primary,
      secondary: Theme.colors.secondary,
      light: Theme.colors.lightGray,
      dark: Theme.colors.darkGray,
      inverted: Theme.colors.white,
    };
    
    return colorMap[variant] || Theme.colors.primary;
  };

  // Container styles
  const containerStyle: StyleProp<ViewStyle> = [
    styles.container,
    center && styles.centered,
    fullScreen && styles.fullScreen,
    style,
  ];

  // Text styles
  const loadingTextStyle = [
    styles.text,
    { color: getColor() },
    textStyle,
  ];

  return (
    <View style={containerStyle} testID="loading-container">
      <ActivityIndicator
        size={typeof size === 'string' ? size : 'large'}
        color={getColor()}
        style={styles.loader}
      />
      {showText && text && (
        <Text style={loadingTextStyle} testID="loading-text">
          {text}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Theme.spacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: Theme.zIndex.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    marginBottom: Theme.spacing.sm,
  },
  text: {
    fontSize: Theme.fonts.body2,
    textAlign: 'center',
  },
});

export default Loading;
