import React, { forwardRef } from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Text } from 'react-native';
import { Theme } from '@constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends TouchableOpacityProps {
  /**
   * The variant of the button
   * @default 'primary'
   */
  variant?: ButtonVariant;
  /**
   * The size of the button
   * @default 'medium'
   */
  size?: ButtonSize;
  /**
   * The text to display inside the button
   */
  title: string;
  /**
   * Whether the button is in a loading state
   * @default false
   */
  loading?: boolean;
  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean;
  /**
   * The icon to display on the left side of the button
   */
  leftIcon?: React.ReactNode;
  /**
   * The icon to display on the right side of the button
   */
  rightIcon?: React.ReactNode;
  /**
   * Custom style for the button container
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Custom style for the button text
   */
  textStyle?: StyleProp<TextStyle>;
  /**
   * Whether the button should take up the full width of its container
   * @default false
   */
  fullWidth?: boolean;
}

/**
 * A customizable button component with multiple variants and sizes.
 */
const Button = forwardRef<TouchableOpacity, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'medium',
      title,
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      style,
      textStyle,
      fullWidth = false,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    // Get button styles based on variant and state
    const getButtonStyles = (): StyleProp<ViewStyle> => {
      const baseStyle: ViewStyle = {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: Theme.borderRadius.md,
        opacity: isDisabled ? 0.6 : 1,
        width: fullWidth ? '100%' : 'auto',
      };

      const sizeStyles: Record<ButtonSize, ViewStyle> = {
        small: {
          paddingVertical: Theme.spacing.xs,
          paddingHorizontal: Theme.spacing.sm,
        },
        medium: {
          paddingVertical: Theme.spacing.sm,
          paddingHorizontal: Theme.spacing.md,
        },
        large: {
          paddingVertical: Theme.spacing.md,
          paddingHorizontal: Theme.spacing.lg,
        },
      };

      const variantStyles: Record<ButtonVariant, ViewStyle> = {
        primary: {
          backgroundColor: Theme.colors.primary,
          ...Theme.shadows.sm,
        },
        secondary: {
          backgroundColor: Theme.colors.secondary,
          ...Theme.shadows.sm,
        },
        outline: {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: Theme.colors.primary,
        },
        text: {
          backgroundColor: 'transparent',
          padding: 0,
        },
        danger: {
          backgroundColor: Theme.colors.error,
          ...Theme.shadows.sm,
        },
      };

      return [baseStyle, sizeStyles[size], variantStyles[variant], style];
    };

    // Get text styles based on variant and state
    const getTextStyles = (): StyleProp<TextStyle> => {
      const baseStyle: TextStyle = {
        textAlign: 'center',
        fontWeight: '600',
      };

      const sizeStyles: Record<ButtonSize, TextStyle> = {
        small: {
          fontSize: Theme.fonts.caption,
          lineHeight: Theme.fonts.lineHeightCaption,
        },
        medium: {
          fontSize: Theme.fonts.body2,
          lineHeight: Theme.fonts.lineHeightBody2,
        },
        large: {
          fontSize: Theme.fonts.body1,
          lineHeight: Theme.fonts.lineHeightBody1,
        },
      };

      const variantStyles: Record<ButtonVariant, TextStyle> = {
        primary: {
          color: Theme.colors.white,
        },
        secondary: {
          color: Theme.colors.white,
        },
        outline: {
          color: Theme.colors.primary,
        },
        text: {
          color: Theme.colors.primary,
        },
        danger: {
          color: Theme.colors.white,
        },
      };

      return [baseStyle, sizeStyles[size], variantStyles[variant], textStyle];
    };

    // Get spacing between icon and text
    const getIconSpacing = () => {
      if (size === 'small') return Theme.spacing.xs;
      if (size === 'large') return Theme.spacing.sm;
      return Theme.spacing.xs;
    };

    return (
      <TouchableOpacity
        ref={ref}
        activeOpacity={0.7}
        style={getButtonStyles()}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        {...props}
      >
        {loading ? (
          <ActivityIndicator
            size={size === 'small' ? 'small' : 'small'}
            color={
              variant === 'outline' || variant === 'text'
                ? Theme.colors.primary
                : Theme.colors.white
            }
          />
        ) : (
          <View style={styles.content}>
            {leftIcon && (
              <View
                style={[
                  styles.iconContainer,
                  { marginRight: getIconSpacing() },
                ]}
              >
                {leftIcon}
              </View>
            )}
            <Text style={getTextStyles()}>
              {title}
            </Text>
            {rightIcon && (
              <View
                style={[
                  styles.iconContainer,
                  { marginLeft: getIconSpacing() },
                ]}
              >
                {rightIcon}
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Button;
