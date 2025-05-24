import React, { useMemo } from 'react';
import {
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';
import { Theme } from '@constants/theme';

// Import icon libraries (you'll need to install these)
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import FontAwesome from 'react-native-vector-icons/FontAwesome';
// import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
// import Feather from 'react-native-vector-icons/Feather';
// import AntDesign from 'react-native-vector-icons/AntDesign';
// import Entypo from 'react-native-vector-icons/Entypo';
// import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
// import Octicons from 'react-native-vector-icons/Octicons';
// import Foundation from 'react-native-vector-icons/Foundation';
// import EvilIcons from 'react-native-vector-icons/EvilIcons';

type IconLibrary =
  | 'material'
  | 'material-community'
  | 'ionicon'
  | 'font-awesome'
  | 'font-awesome5'
  | 'feather'
  | 'ant-design'
  | 'entypo'
  | 'simple-line-icon'
  | 'octicons'
  | 'foundation'
  | 'evil-icons';

type IconVariant = 'solid' | 'outline' | 'duotone' | 'sharp';

interface IconProps {
  /**
   * The name of the icon (as per the icon library's naming convention)
   */
  name: string;
  /**
   * The icon library to use
   * @default 'material'
   */
  library?: IconLibrary;
  /**
   * The size of the icon (in pixels)
   * @default 24
   */
  size?: number;
  /**
   * The color of the icon
   * @default Theme.colors.text
   */
  color?: string;
  /**
   * The variant of the icon (if supported by the library)
   */
  variant?: IconVariant;
  /**
   * Whether the icon should be pressable
   * @default false
   */
  pressable?: boolean;
  /**
   * Callback when the icon is pressed (only works if pressable is true)
   */
  onPress?: () => void;
  /**
   * Additional styles for the icon container
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Additional styles for the icon
   */
  iconStyle?: StyleProp<TextStyle>;
  /**
   * Whether the icon should be disabled
   * @default false
   */
  disabled?: boolean;
  /**
   * The opacity of the icon when pressed (only works if pressable is true)
   * @default 0.7
   */
  activeOpacity?: number;
  /**
   * Whether to apply a background color to the icon container
   * @default false
   */
  withBackground?: boolean;
  /**
   * The background color of the icon container (only works if withBackground is true)
   * @default 'rgba(0, 0, 0, 0.1)'
   */
  backgroundColor?: string;
  /**
   * The border radius of the icon container (only works if withBackground is true)
   * @default Theme.borderRadius.full
   */
  borderRadius?: number;
  /**
   * The padding around the icon (only works if withBackground is true)
   * @default 8
   */
  padding?: number;
  /**
   * Whether to show a badge on the icon
   * @default false
   */
  showBadge?: boolean;
  /**
   * The content of the badge (if showBadge is true)
   */
  badgeContent?: string | number;
  /**
   * The color of the badge (if showBadge is true)
   * @default Theme.colors.error
   */
  badgeColor?: string;
  /**
   * The size of the badge (if showBadge is true)
   * @default 16
   */
  badgeSize?: number;
  /**
   * The position of the badge (if showBadge is true)
   * @default { top: -4, right: -4 }
   */
  badgePosition?: { top?: number; right?: number; bottom?: number; left?: number };
  /**
   * Additional props for the badge (if showBadge is true)
   */
  badgeProps?: any;
  /**
   * Test ID for testing purposes
   */
  testID?: string;
}

/**
 * A customizable icon component that supports multiple icon libraries.
 */
const Icon: React.FC<IconProps> = ({
  name,
  library = 'material',
  size = 24,
  color = Theme.colors.text,
  variant,
  pressable = false,
  onPress,
  style,
  iconStyle,
  disabled = false,
  activeOpacity = 0.7,
  withBackground = false,
  backgroundColor = 'rgba(0, 0, 0, 0.1)',
  borderRadius = Theme.borderRadius.full,
  padding = 8,
  showBadge = false,
  badgeContent,
  badgeColor = Theme.colors.error,
  badgeSize = 16,
  badgePosition = { top: -4, right: -4 },
  badgeProps,
  testID = 'icon',
  ...rest
}) => {
  // Determine the icon color based on the disabled state
  const iconColor = disabled ? Theme.colors.textDisabled : color;

  // Render the appropriate icon based on the library
  const renderIcon = () => {
    const iconProps = {
      name,
      size,
      color: iconColor,
      style: [styles.icon, iconStyle],
    };

    // Note: Uncomment and install the appropriate icon libraries as needed
    switch (library) {
      // case 'material':
      //   return <MaterialIcons {...iconProps} />;
      // case 'material-community':
      //   return <MaterialCommunityIcons {...iconProps} />;
      // case 'ionicon':
      //   return <Ionicons {...iconProps} />;
      // case 'font-awesome':
      //   return <FontAwesome {...iconProps} />;
      // case 'font-awesome5':
      //   return <FontAwesome5 {...iconProps} solid={variant === 'solid'} />;
      // case 'feather':
      //   return <Feather {...iconProps} />;
      // case 'ant-design':
      //   return <AntDesign {...iconProps} />;
      // case 'entypo':
      //   return <Entypo {...iconProps} />;
      // case 'simple-line-icon':
      //   return <SimpleLineIcons {...iconProps} />;
      // case 'octicons':
      //   return <Octicons {...iconProps} />;
      // case 'foundation':
      //   return <Foundation {...iconProps} />;
      // case 'evil-icons':
      //   return <EvilIcons {...iconProps} />;
      default:
        // Fallback to a simple view with the icon name
        return (
          <View
            style={[
              styles.fallbackIcon,
              { width: size, height: size, borderRadius: size / 2 },
              { backgroundColor: iconColor },
            ]}
          />
        );
    }
  };

  // Render the badge if needed
  const renderBadge = () => {
    if (!showBadge) return null;

    const badgeStyle = {
      position: 'absolute' as const,
      top: badgePosition.top !== undefined ? badgePosition.top : -4,
      right: badgePosition.right !== undefined ? badgePosition.right : -4,
      bottom: badgePosition.bottom,
      left: badgePosition.left,
      minWidth: badgeSize,
      height: badgeSize,
      borderRadius: badgeSize / 2,
      backgroundColor: badgeColor,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 2,
      zIndex: 1,
    };

    const badgeTextStyle = {
      color: Theme.colors.white,
      fontSize: Math.max(10, badgeSize * 0.7),
      fontWeight: 'bold' as const,
    };

    return (
      <View style={[styles.badge, badgeStyle]} {...badgeProps}>
        {badgeContent && (
          <Text style={badgeTextStyle} numberOfLines={1}>
            {typeof badgeContent === 'number' && badgeContent > 99 ? '99+' : badgeContent}
          </Text>
        )}
      </View>
    );
  };

  // Container styles
  const containerStyle = useMemo(
    () => [
      styles.container,
      withBackground && [
        styles.withBackground,
        { backgroundColor, borderRadius, padding },
      ],
      style,
    ],
    [withBackground, backgroundColor, borderRadius, padding, style]
  );

  // If the icon is pressable, wrap it in a TouchableOpacity
  if (pressable || onPress) {
    return (
      <TouchableOpacity
        activeOpacity={activeOpacity}
        onPress={onPress}
        disabled={disabled}
        style={containerStyle}
        testID={`${testID}-button`}
        {...rest as TouchableOpacityProps}
      >
        {renderIcon()}
        {renderBadge()}
      </TouchableOpacity>
    );
  }

  // Otherwise, just render the icon in a View
  return (
    <View style={containerStyle} testID={testID} {...rest}>
      {renderIcon()}
      {renderBadge()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  withBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  icon: {
    textAlign: 'center',
  },
  fallbackIcon: {
    backgroundColor: '#ccc',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Theme.colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
    zIndex: 1,
  },
});

export default Icon;
