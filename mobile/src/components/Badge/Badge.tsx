import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { Theme } from '@constants/theme';

type BadgeVariant = 'solid' | 'outline' | 'subtle' | 'dot';
type BadgeColor = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'gray' | string;
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends Omit<TouchableOpacityProps, 'onPress'> {
  /**
   * The content of the badge (text or number)
   */
  children?: React.ReactNode;
  /**
   * The variant of the badge
   * @default 'solid'
   */
  variant?: BadgeVariant;
  /**
   * The color scheme of the badge
   * @default 'primary'
   */
  colorScheme?: BadgeColor;
  /**
   * The size of the badge
   * @default 'md'
   */
  size?: BadgeSize;
  /**
   * Whether the badge should be rounded (circular)
   * @default false
   */
  rounded?: boolean;
  /**
   * Whether the badge should be clickable
   * @default false
   */
  pressable?: boolean;
  /**
   * Callback when the badge is pressed (only works if pressable is true)
   */
  onPress?: () => void;
  /**
   * Custom styles for the badge container
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Custom styles for the badge text
   */
  textStyle?: StyleProp<TextStyle>;
  /**
   * Custom icon to display on the left side of the text
   */
  leftIcon?: React.ReactNode;
  /**
   * Custom icon to display on the right side of the text
   */
  rightIcon?: React.ReactNode;
  /**
   * Whether to show a dot instead of text (overrides children)
   * @default false
   */
  dot?: boolean;
  /**
   * The maximum number of characters to show in the badge (truncates with ellipsis)
   */
  maxLength?: number;
  /**
   * Additional props for the text component
   */
  textProps?: any;
  /**
   * Test ID for testing purposes
   */
  testID?: string;
}

/**
 * A customizable badge component that can be used to highlight information.
 */
const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'solid',
  colorScheme = 'primary',
  size = 'md',
  rounded = false,
  pressable = false,
  onPress,
  style,
  textStyle,
  leftIcon,
  rightIcon,
  dot = false,
  maxLength,
  textProps,
  testID = 'badge',
  ...rest
}) => {
  // Get the color values based on the color scheme
  const getColorValues = () => {
    // If colorScheme is a theme color key, use it, otherwise use the value as a color
    const colorValue = Theme.colors[colorScheme as keyof typeof Theme.colors] || colorScheme;
    
    // Default colors for light theme
    const lightBg = `${colorValue}20`; // 20% opacity
    const darkBg = colorValue;
    const lightText = Theme.colors.white;
    const darkText = Theme.colors.white;
    const borderColor = colorValue;
    
    // Adjust colors based on variant
    switch (variant) {
      case 'solid':
        return {
          bg: darkBg,
          text: lightText,
          borderColor: 'transparent',
        };
      case 'outline':
        return {
          bg: 'transparent',
          text: darkText,
          borderColor,
        };
      case 'subtle':
        return {
          bg: lightBg,
          text: darkText,
          borderColor: 'transparent',
        };
      case 'dot':
        return {
          bg: darkBg,
          text: 'transparent',
          borderColor: 'transparent',
        };
      default:
        return {
          bg: darkBg,
          text: lightText,
          borderColor: 'transparent',
        };
    }
  };

  // Get the size values based on the size prop
  const getSizeValues = () => {
    const sizeMap = {
      sm: {
        paddingVertical: 2,
        paddingHorizontal: 6,
        fontSize: Theme.fonts.caption,
        dotSize: 6,
      },
      md: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        fontSize: Theme.fonts.body2,
        dotSize: 8,
      },
      lg: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        fontSize: Theme.fonts.body1,
        dotSize: 10,
      },
    };

    return sizeMap[size] || sizeMap.md;
  };

  const { bg, text, borderColor } = getColorValues();
  const { paddingVertical, paddingHorizontal, fontSize, dotSize } = getSizeValues();

  // Truncate text if maxLength is provided
  const renderContent = () => {
    if (dot || variant === 'dot') {
      return null;
    }

    if (typeof children === 'string' || typeof children === 'number') {
      let content = String(children);
      
      if (maxLength && content.length > maxLength) {
        content = `${content.substring(0, maxLength)}…`;
      }
      
      return (
        <Text
          style={[
            styles.text,
            {
              color: text,
              fontSize,
              marginLeft: leftIcon ? 4 : 0,
              marginRight: rightIcon ? 4 : 0,
            },
            textStyle,
          ]}
          numberOfLines={1}
          {...textProps}
        >
          {content}
        </Text>
      );
    }
    
    return children;
  };

  // Container styles
  const containerStyle: StyleProp<ViewStyle> = [
    styles.container,
    {
      backgroundColor: bg,
      borderWidth: variant === 'outline' ? 1 : 0,
      borderColor,
      borderRadius: rounded ? 999 : Theme.borderRadius.sm,
      paddingVertical,
      paddingHorizontal: dot ? paddingVertical : paddingHorizontal,
      minWidth: dot ? dotSize : 'auto',
      height: dot ? dotSize : 'auto',
      alignSelf: 'flex-start',
    },
    style,
  ];

  // Render the badge content
  const badgeContent = (
    <View style={styles.content}>
      {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
      {renderContent()}
      {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
    </View>
  );

  // If the badge is pressable, wrap it in a TouchableOpacity
  if (pressable || onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={containerStyle}
        testID={`${testID}-button`}
        {...rest}
      >
        {badgeContent}
      </TouchableOpacity>
    );
  }

  // Otherwise, just render the badge in a View
  return (
    <View style={containerStyle} testID={testID} {...rest}>
      {badgeContent}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  leftIcon: {
    marginRight: 4,
  },
  rightIcon: {
    marginLeft: 4,
  },
});

export default memo(Badge);
