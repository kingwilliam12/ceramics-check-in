import React, { forwardRef, useState, useImperativeHandle, useRef } from 'react';
import {
  View,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  TextInputFocusEventData,
  NativeSyntheticEvent,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Theme } from '@constants/theme';
import Text from '../Text';

// Import icons from your icon library (e.g., react-native-vector-icons)
// import Icon from 'react-native-vector-icons/MaterialIcons';

// Size variants for the input
const INPUT_SIZES = {
  small: {
    height: 36,
    paddingHorizontal: Theme.spacing.sm,
    fontSize: Theme.fonts.caption,
  },
  medium: {
    height: 48,
    paddingHorizontal: Theme.spacing.md,
    fontSize: Theme.fonts.body2,
  },
  large: {
    height: 56,
    paddingHorizontal: Theme.spacing.lg,
    fontSize: Theme.fonts.body1,
  },
} as const;

type InputSize = keyof typeof INPUT_SIZES;
type InputVariant = 'outline' | 'filled' | 'underline' | 'unstyled';

export interface InputProps extends Omit<RNTextInputProps, 'style'> {
  /**
   * The label to display above the input
   */
  label?: string;
  /**
   * The helper text to display below the input
   */
  helperText?: string;
  /**
   * The error message to display below the input
   */
  error?: string | boolean;
  /**
   * The variant of the input
   * @default 'outline'
   */
  variant?: InputVariant;
  /**
   * The size of the input
   * @default 'medium'
   */
  size?: InputSize;
  /**
   * The icon to display on the left side of the input
   */
  leftIcon?: React.ReactNode;
  /**
   * The icon to display on the right side of the input
   */
  rightIcon?: React.ReactNode;
  /**
   * Whether the input should take up the full width of its container
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Whether the input is required
   * @default false
   */
  required?: boolean;
  /**
   * Whether the input is disabled
   * @default false
   */
  disabled?: boolean;
  /**
   * Whether to show the character count
   * @default false
   */
  showCount?: boolean;
  /**
   * The maximum number of characters allowed
   */
  maxLength?: number;
  /**
   * Custom styles for the container
   */
  containerStyle?: StyleProp<ViewStyle>;
  /**
   * Custom styles for the input
   */
  inputStyle?: StyleProp<TextStyle>;
  /**
   * Custom styles for the label
   */
  labelStyle?: StyleProp<TextStyle>;
  /**
   * Custom styles for the helper text
   */
  helperTextStyle?: StyleProp<TextStyle>;
  /**
   * Callback when the input is focused
   */
  onFocus?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  /**
   * Callback when the input is blurred
   */
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
}

/**
 * A customizable input component with support for labels, validation, and error messages.
 */
const Input = forwardRef<RNTextInput, InputProps>(
  (
    {
      label,
      helperText,
      error,
      variant = 'outline',
      size = 'medium',
      leftIcon,
      rightIcon,
      fullWidth = false,
      required = false,
      disabled = false,
      showCount = false,
      maxLength,
      containerStyle,
      inputStyle,
      labelStyle,
      helperTextStyle,
      onFocus,
      onBlur,
      value,
      ...props
    },
 ref
  ) => {
    const inputRef = useRef<RNTextInput>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    // Expose focus and blur methods
    useImperativeHandle(ref, () => inputRef.current as RNTextInput);

    const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const togglePasswordVisibility = () => {
      setIsPasswordVisible(!isPasswordVisible);
    };

    // Determine if the input is in an error state
    const hasError = Boolean(error);
    const errorMessage = typeof error === 'string' ? error : '';

    // Get the input container styles based on variant and state
    const getContainerStyles = (): StyleProp<ViewStyle> => {
      const baseStyles: ViewStyle = {
        width: fullWidth ? '100%' : 'auto',
        opacity: disabled ? 0.6 : 1,
      };

      const variantStyles: Record<InputVariant, ViewStyle> = {
        outline: {
          borderWidth: 1,
          borderColor: hasError
            ? Theme.colors.error
            : isFocused
            ? Theme.colors.primary
            : Theme.colors.border,
          borderRadius: Theme.borderRadius.md,
          backgroundColor: Theme.colors.surface,
        },
        filled: {
          backgroundColor: hasError
            ? `${Theme.colors.error}10`
            : isFocused
            ? `${Theme.colors.primary}05`
            : `${Theme.colors.border}20`,
          borderRadius: Theme.borderRadius.md,
          borderWidth: 1,
          borderColor: hasError
            ? `${Theme.colors.error}20`
            : isFocused
            ? `${Theme.colors.primary}20`
            : 'transparent',
        },
        underline: {
          borderBottomWidth: 1,
          borderColor: hasError
            ? Theme.colors.error
            : isFocused
            ? Theme.colors.primary
            : Theme.colors.border,
          backgroundColor: 'transparent',
          borderRadius: 0,
        },
        unstyled: {
          backgroundColor: 'transparent',
          borderWidth: 0,
        },
      };

      return [baseStyles, variantStyles[variant]];
    };

    // Get the input styles based on size and variant
    const getInputStyles = (): StyleProp<TextStyle> => {
      const sizeStyles = INPUT_SIZES[size] || INPUT_SIZES.medium;
      const paddingLeft = leftIcon ? Theme.spacing.md : sizeStyles.paddingHorizontal;
      const paddingRight = rightIcon || props.secureTextEntry ? Theme.spacing.md : sizeStyles.paddingHorizontal;

      return [
        {
          flex: 1,
          paddingLeft,
          paddingRight,
          color: disabled ? Theme.colors.textDisabled : Theme.colors.text,
          fontSize: sizeStyles.fontSize,
          fontFamily: Theme.fonts.regular,
          paddingVertical: 0, // Reset default padding
          margin: 0, // Reset default margin
          ...Platform.select({
            web: {
              outlineWidth: 0, // Remove default web outline
            },
          }),
        },
        inputStyle,
      ];
    };

    // Determine secure text entry state
    const secureTextEntry = props.secureTextEntry && !isPasswordVisible;

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Text 
            variant="label" 
            style={[
              styles.label,
              hasError && styles.labelError,
              disabled && styles.labelDisabled,
              labelStyle,
            ]}
          >
            {label}
            {required && (
              <Text variant="caption" color="error">
                {' '}*
              </Text>
            )}
          </Text>
        )}

        <View
          style={[
            styles.inputContainer,
            getContainerStyles(),
            { height: INPUT_SIZES[size].height },
          ]}
        >
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

          <RNTextInput
            ref={inputRef}
            style={getInputStyles()}
            placeholderTextColor={Theme.colors.textDisabled}
            editable={!disabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            value={value}
            maxLength={maxLength}
            secureTextEntry={secureTextEntry}
            {...props}
          />

          {props.secureTextEntry ? (
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              style={styles.rightIcon}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              {/* <Icon
                name={isPasswordVisible ? 'visibility-off' : 'visibility'}
                size={20}
                color={Theme.colors.textSecondary}
              /> */}
              <Text>{isPasswordVisible ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          ) : rightIcon ? (
            <View style={styles.rightIcon}>{rightIcon}</View>
          ) : null}
        </View>

        {(helperText || hasError || showCount) && (
          <View style={styles.footer}>
            <View style={styles.helperTextContainer}>
              {(helperText || hasError) && (
                <Text
                  variant="caption"
                  style={[
                    styles.helperText,
                    hasError && styles.errorText,
                    helperTextStyle,
                  ]}
                  numberOfLines={1}
                >
                  {hasError ? errorMessage : helperText}
                </Text>
              )}
            </View>

            {showCount && maxLength && (
              <Text
                variant="caption"
                style={[
                  styles.counter,
                  hasError && styles.errorText,
                ]}
              >
                {value?.length || 0}/{maxLength}
              </Text>
            )}
          </View>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.sm,
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  label: {
    marginBottom: Theme.spacing.xs,
  },
  labelError: {
    color: Theme.colors.error,
  },
  labelDisabled: {
    color: Theme.colors.textDisabled,
  },
  leftIcon: {
    marginLeft: Theme.spacing.sm,
    marginRight: -Theme.spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIcon: {
    marginRight: Theme.spacing.sm,
    marginLeft: -Theme.spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Theme.spacing.xs,
    minHeight: 16, // Ensure consistent height even when empty
  },
  helperTextContainer: {
    flex: 1,
    marginRight: Theme.spacing.sm,
  },
  helperText: {
    color: Theme.colors.textSecondary,
  },
  errorText: {
    color: Theme.colors.error,
  },
  counter: {
    color: Theme.colors.textSecondary,
    textAlign: 'right',
  },
});

export default Input;
