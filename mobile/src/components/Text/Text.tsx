import React, { forwardRef } from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  StyleSheet,
  StyleProp,
  TextStyle,
} from 'react-native';
import { Theme } from '@constants/theme';

type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'body1'
  | 'body2'
  | 'caption'
  | 'overline'
  | 'button'
  | 'label';

type TextWeight = 'regular' | 'medium' | 'semiBold' | 'bold';

type TextColor = keyof typeof Theme.colors | string;

interface TextProps extends RNTextProps {
  /**
   * The variant of the text (h1, h2, body1, etc.)
   * @default 'body1'
   */
  variant?: TextVariant;
  /**
   * The weight of the text
   * @default 'regular'
   */
  weight?: TextWeight;
  /**
   * The color of the text
   * @default 'text'
   */
  color?: TextColor;
  /**
   * Whether the text should be centered
   * @default false
   */
  center?: boolean;
  /**
   * Whether the text should be uppercase
   * @default false
   */
  uppercase?: boolean;
  /**
   * Whether the text should have a line through it
   * @default false
   */
  lineThrough?: boolean;
  /**
   * Whether the text should be underlined
   * @default false
   */
  underline?: boolean;
  /**
   * Additional styles to apply to the text
   */
  style?: StyleProp<TextStyle>;
  /**
   * The number of lines to display before truncating the text with an ellipsis
   */
  numberOfLines?: number;
  /**
   * Whether the text should be selectable
   * @default false
   */
  selectable?: boolean;
  /**
   * Whether the text should be scaled according to the system font size
   * @default true
   */
  allowFontScaling?: boolean;
}

/**
 * A customizable text component that supports typography variants and theming.
 */
const Text = forwardRef<RNText, TextProps>(
  (
    {
      variant = 'body1',
      weight = 'regular',
      color = 'text',
      center = false,
      uppercase = false,
      lineThrough = false,
      underline = false,
      style,
      numberOfLines,
      selectable = false,
      allowFontScaling = true,
      children,
      ...props
    },
    ref
  ) => {
    // Get the base text style based on the variant
    const getBaseStyle = (): TextStyle => {
      const variantStyles: Record<TextVariant, TextStyle> = {
        h1: {
          fontSize: Theme.fonts.h1,
          lineHeight: Theme.fonts.lineHeightH1,
          fontWeight: 'bold',
        },
        h2: {
          fontSize: Theme.fonts.h2,
          lineHeight: Theme.fonts.lineHeightH2,
          fontWeight: 'bold',
        },
        h3: {
          fontSize: Theme.fonts.h3,
          lineHeight: Theme.fonts.lineHeightH3,
          fontWeight: 'bold',
        },
        h4: {
          fontSize: Theme.fonts.h4,
          lineHeight: Theme.fonts.lineHeightH4,
          fontWeight: '600',
        },
        h5: {
          fontSize: Theme.fonts.h5,
          lineHeight: Theme.fonts.lineHeightH5,
          fontWeight: '600',
        },
        h6: {
          fontSize: Theme.fonts.h6,
          lineHeight: Theme.fonts.lineHeightH6,
          fontWeight: '600',
        },
        body1: {
          fontSize: Theme.fonts.body1,
          lineHeight: Theme.fonts.lineHeightBody1,
        },
        body2: {
          fontSize: Theme.fonts.body2,
          lineHeight: Theme.fonts.lineHeightBody2,
        },
        caption: {
          fontSize: Theme.fonts.caption,
          lineHeight: Theme.fonts.lineHeightCaption,
        },
        overline: {
          fontSize: Theme.fonts.overline,
          lineHeight: Theme.fonts.lineHeightOverline,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
        },
        button: {
          fontSize: Theme.fonts.body2,
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
        label: {
          fontSize: Theme.fonts.caption,
          color: Theme.colors.textSecondary,
          marginBottom: Theme.spacing.xs,
        },
      };

      return variantStyles[variant] || variantStyles.body1;
    };

    // Get the weight style
    const getWeightStyle = (): TextStyle => {
      const weightStyles: Record<TextWeight, TextStyle> = {
        regular: { fontFamily: Theme.fonts.regular },
        medium: { fontFamily: Theme.fonts.medium },
        semiBold: { fontFamily: Theme.fonts.semiBold },
        bold: { fontFamily: Theme.fonts.bold, fontWeight: 'bold' },
      };

      return weightStyles[weight] || {};
    };

    // Get the color style
    const getColorStyle = (): TextStyle => {
      // If the color is a theme color key, use it, otherwise use the color as is
      const colorValue = Theme.colors[color as keyof typeof Theme.colors] || color;
      return { color: colorValue };
    };

    // Combine all styles
    const textStyle = StyleSheet.flatten([
      styles.base,
      getBaseStyle(),
      getWeightStyle(),
      getColorStyle(),
      center && styles.center,
      uppercase && styles.uppercase,
      lineThrough && styles.lineThrough,
      underline && styles.underline,
      style,
    ]);

    return (
      <RNText
        ref={ref}
        style={textStyle}
        numberOfLines={numberOfLines}
        selectable={selectable}
        allowFontScaling={allowFontScaling}
        {...props}
      >
        {children}
      </RNText>
    );
  }
);

const styles = StyleSheet.create({
  base: {
    color: Theme.colors.text,
  },
  center: {
    textAlign: 'center',
  },
  uppercase: {
    textTransform: 'uppercase',
  },
  lineThrough: {
    textDecorationLine: 'line-through',
  },
  underline: {
    textDecorationLine: 'underline',
  },
});

export default Text;
