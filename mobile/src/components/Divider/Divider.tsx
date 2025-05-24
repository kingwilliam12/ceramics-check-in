import React, { memo } from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { Theme } from '@constants/theme';

type DividerOrientation = 'horizontal' | 'vertical';
type DividerVariant = 'solid' | 'dashed' | 'dotted';

interface DividerProps {
  /**
   * The orientation of the divider
   * @default 'horizontal'
   */
  orientation?: DividerOrientation;
  /**
   * The variant of the divider
   * @default 'solid'
   */
  variant?: DividerVariant;
  /**
   * The color of the divider
   * @default Theme.colors.border
   */
  color?: string;
  /**
   * The thickness of the divider (in pixels)
   * @default 1
   */
  thickness?: number;
  /**
   * The length of each dash (for dashed variant)
   * @default 4
   */
  dashLength?: number;
  /**
   * The space between dashes (for dashed variant)
   * @default 4
   */
  dashGap?: number;
  /**
   * Whether the divider should be full width/height of its container
   * @default true
   */
  fullWidth?: boolean;
  /**
   * Custom styles for the divider container
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Custom styles for the divider line
   */
  lineStyle?: StyleProp<ViewStyle>;
  /**
   * Text to display in the middle of the divider (horizontal only)
   */
  text?: string;
  /**
   * Position of the text (horizontal only)
   * @default 'center'
   */
  textPosition?: 'left' | 'center' | 'right';
  /**
   * Custom styles for the text
   */
  textStyle?: StyleProp<ViewStyle>;
  /**
   * Whether to show a line on both sides of the text (horizontal only)
   * @default true
   */
  showLineWithText?: boolean;
  /**
   * The margin around the divider
   * @default { vertical: 8, horizontal: 0 }
   */
  margin?: { vertical?: number; horizontal?: number };
  /**
   * Test ID for testing purposes
   */
  testID?: string;
}

/**
 * A customizable divider component that can be used to separate content.
 */
const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  variant = 'solid',
  color = Theme.colors.border,
  thickness = 1,
  dashLength = 4,
  dashGap = 4,
  fullWidth = true,
  style,
  lineStyle,
  text,
  textPosition = 'center',
  textStyle,
  showLineWithText = true,
  margin = { vertical: 8, horizontal: 0 },
  testID = 'divider',
}) => {
  // Determine the styles based on orientation
  const isHorizontal = orientation === 'horizontal';

  // Base line styles
  const baseLineStyle: ViewStyle = {
    backgroundColor: variant === 'solid' ? color : 'transparent',
    height: isHorizontal ? thickness : '100%',
    width: isHorizontal ? '100%' : thickness,
  };

  // Container styles
  const containerStyle: StyleProp<ViewStyle> = [
    styles.container,
    {
      flexDirection: isHorizontal ? 'column' : 'row',
      width: isHorizontal ? '100%' : thickness,
      height: isHorizontal ? 'auto' : '100%',
      marginVertical: margin.vertical,
      marginHorizontal: margin.horizontal,
      alignItems: 'center',
      justifyContent: 'center',
    },
    !fullWidth && {
      width: isHorizontal ? 'auto' : thickness,
      height: isHorizontal ? thickness : 'auto',
    },
    style,
  ];

  // Render a single line
  const renderLine = (key?: string, flex?: number) => (
    <View
      key={key}
      style={[
        baseLineStyle,
        variant === 'dashed' && {
          ...styles.dashedLine,
          ...(isHorizontal
            ? {
                borderBottomWidth: thickness,
                borderBottomColor: color,
                borderStyle: 'dashed',
                borderTopWidth: 0,
                borderLeftWidth: 0,
                borderRightWidth: 0,
                height: 0,
                width: dashLength,
                marginHorizontal: dashGap / 2,
              }
            : {
                borderRightWidth: thickness,
                borderRightColor: color,
                borderStyle: 'dashed',
                borderTopWidth: 0,
                borderBottomWidth: 0,
                borderLeftWidth: 0,
                width: 0,
                height: dashLength,
                marginVertical: dashGap / 2,
              }),
        },
        variant === 'dotted' && {
          ...styles.dottedLine,
          ...(isHorizontal
            ? {
                width: dashLength,
                height: dashLength,
                borderRadius: dashLength / 2,
                marginHorizontal: dashGap / 2,
              }
            : {
                width: dashLength,
                height: dashLength,
                borderRadius: dashLength / 2,
                marginVertical: dashGap / 2,
              }),
        },
        lineStyle,
      ]}
    />
  );

  // Render multiple dashed/dotted lines
  const renderPatternedLine = () => {
    if (variant === 'solid') return renderLine();

    const lineCount = 20; // Arbitrary large number to ensure full width/height coverage
    const lines = [];

    for (let i = 0; i < lineCount; i++) {
      lines.push(renderLine(`line-${i}`));
    }

    return (
      <View
        style={[
          styles.patternedContainer,
          {
            flexDirection: isHorizontal ? 'row' : 'column',
          },
        ]}
      >
        {lines}
      </View>
    );
  };

  // Render divider with text
  const renderDividerWithText = () => {
    if (!text || !isHorizontal) return renderPatternedLine();

    return (
      <View style={[styles.textContainer, { width: '100%' }]}>
        {(textPosition === 'center' || textPosition === 'right') && showLineWithText && (
          <View style={{ flex: textPosition === 'center' ? 1 : 0.1 }}>
            {renderPatternedLine()}
          </View>
        )}
        
        <View style={styles.textWrapper}>
          <Text
            style={[
              styles.text,
              {
                color: Theme.colors.textSecondary,
                marginHorizontal: Theme.spacing.sm,
              },
              textStyle,
            ]}
          >
            {text}
          </Text>
        </View>
        
        {(textPosition === 'center' || textPosition === 'left') && showLineWithText && (
          <View style={{ flex: textPosition === 'center' ? 1 : 0.9 }}>
            {renderPatternedLine()}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={containerStyle} testID={testID}>
      {renderDividerWithText()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  patternedContainer: {
    flexWrap: 'wrap',
    alignContent: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  dashedLine: {
    backgroundColor: 'transparent',
  },
  dottedLine: {
    backgroundColor: 'currentColor',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrapper: {
    paddingHorizontal: 4,
  },
  text: {
    textAlign: 'center',
  },
});

export default memo(Divider);
