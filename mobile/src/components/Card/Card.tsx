import React, { ReactNode } from 'react';
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewProps,
} from 'react-native';
import { Theme } from '@constants/theme';
import Text from '../Text';

type CardVariant = 'elevated' | 'outline' | 'filled' | 'unstyled';
type CardSize = 'sm' | 'md' | 'lg';

interface CardProps extends TouchableOpacityProps {
  /**
   * The content of the card
   */
  children: ReactNode;
  /**
   * The title of the card (optional)
   */
  title?: string;
  /**
   * The subtitle of the card (optional)
   */
  subtitle?: string;
  /**
   * The footer content of the card (optional)
   */
  footer?: ReactNode;
  /**
   * The variant of the card
   * @default 'elevated'
   */
  variant?: CardVariant;
  /**
   * The size of the card
   * @default 'md'
   */
  size?: CardSize;
  /**
   * Whether the card is pressable
   * @default false
   */
  pressable?: boolean;
  /**
   * Whether the card has full width
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Custom styles for the card container
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Custom styles for the card content
   */
  contentStyle?: StyleProp<ViewStyle>;
  /**
   * Custom styles for the card header
   */
  headerStyle?: StyleProp<ViewStyle>;
  /**
   * Custom styles for the card footer
   */
  footerStyle?: StyleProp<ViewStyle>;
  /**
   * Callback when the card is pressed (only works if pressable is true)
   */
  onPress?: () => void;
  /**
   * Additional props for the card container
   */
  containerProps?: ViewProps;
}

/**
 * A customizable card component that can display content in a contained, elevated container.
 */
const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  footer,
  variant = 'elevated',
  size = 'md',
  pressable = false,
  fullWidth = false,
  style,
  contentStyle,
  headerStyle,
  footerStyle,
  onPress,
  containerProps,
  ...rest
}) => {
  // Get the base card styles based on variant and size
  const getCardStyles = (): StyleProp<ViewStyle> => {
    const baseStyles: ViewStyle = {
      width: fullWidth ? '100%' : undefined,
      borderRadius: Theme.borderRadius.lg,
      overflow: 'hidden',
    };

    const variantStyles: Record<CardVariant, ViewStyle> = {
      elevated: {
        backgroundColor: Theme.colors.surface,
        ...Theme.shadows.md,
      },
      outline: {
        backgroundColor: Theme.colors.surface,
        borderWidth: 1,
        borderColor: Theme.colors.border,
      },
      filled: {
        backgroundColor: `${Theme.colors.primary}10`,
        borderWidth: 1,
        borderColor: `${Theme.colors.primary}20`,
      },
      unstyled: {
        backgroundColor: 'transparent',
      },
    };

    const sizeStyles: Record<CardSize, ViewStyle> = {
      sm: {
        borderRadius: Theme.borderRadius.md,
      },
      md: {
        borderRadius: Theme.borderRadius.lg,
      },
      lg: {
        borderRadius: Theme.borderRadius.xl,
      },
    };

    return [baseStyles, variantStyles[variant], sizeStyles[size], style];
  };

  // Get the content padding based on size
  const getContentPadding = () => {
    const paddingMap: Record<CardSize, number> = {
      sm: Theme.spacing.sm,
      md: Theme.spacing.md,
      lg: Theme.spacing.lg,
    };
    return paddingMap[size];
  };

  // Get the title variant based on size
  const getTitleVariant = () => {
    const variantMap: Record<CardSize, 'h5' | 'h4' | 'h3'> = {
      sm: 'h5',
      md: 'h4',
      lg: 'h3',
    };
    return variantMap[size];
  };

  // Get the subtitle variant based on size
  const getSubtitleVariant = () => {
    const variantMap: Record<CardSize, 'body2' | 'body1' | 'h6'> = {
      sm: 'body2',
      md: 'body1',
      lg: 'h6',
    };
    return variantMap[size];
  };

  // Render the card header if title or subtitle is provided
  const renderHeader = () => {
    if (!title && !subtitle) return null;

    return (
      <View style={[styles.header, headerStyle]}>
        {title && (
          <Text variant={getTitleVariant()} style={styles.title}>
            {title}
          </Text>
        )}
        {subtitle && (
          <Text
            variant={getSubtitleVariant()}
            color="textSecondary"
            style={styles.subtitle}
          >
            {subtitle}
          </Text>
        )}
      </View>
    );
  };

  // Render the card footer if provided
  const renderFooter = () => {
    if (!footer) return null;

    return <View style={[styles.footer, footerStyle]}>{footer}</View>;
  };

  // The main card content
  const cardContent = (
    <View style={[getCardStyles(), styles.card]} {...containerProps}>
      {renderHeader()}
      <View style={[styles.content, { padding: getContentPadding() }, contentStyle]}>
        {children}
      </View>
      {renderFooter()}
    </View>
  );

  // If the card is pressable, wrap it in a TouchableOpacity
  if (pressable || onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={styles.touchable}
        {...rest}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  touchable: {
    width: '100%',
  },
  header: {
    padding: Theme.spacing.md,
    paddingBottom: 0,
  },
  title: {
    marginBottom: Theme.spacing.xs,
  },
  subtitle: {
    marginBottom: Theme.spacing.xs,
  },
  content: {
    width: '100%',
  },
  footer: {
    padding: Theme.spacing.md,
    paddingTop: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});

export default Card;
