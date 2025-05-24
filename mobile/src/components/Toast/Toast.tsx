import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
  Dimensions,
  StatusBar,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '@constants/theme';
import Icon from '../Icon';

type ToastType = 'success' | 'error' | 'info' | 'warning' | 'default';
type ToastPosition = 'top' | 'bottom' | 'center';

export interface ToastOptions {
  /**
   * The type of toast
   * @default 'default'
   */
  type?: ToastType;
  /**
   * The position of the toast
   * @default 'top'
   */
  position?: ToastPosition;
  /**
   * The duration in milliseconds before the toast is automatically closed
   * Set to 0 to prevent auto-dismissal
   * @default 3000
   */
  duration?: number;
  /**
   * Whether the toast can be dismissed by swiping
   * @default true
   */
  swipeToClose?: boolean;
  /**
   * The offset from the top/bottom of the screen (in pixels)
   * @default 16
   */
  offset?: number;
  /**
   * Custom styles for the toast container
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Custom styles for the text
   */
  textStyle?: StyleProp<TextStyle>;
  /**
   * Custom icon name (overrides the default icon for the type)
   */
  icon?: string;
  /**
   * Custom icon library
   * @default 'material-community'
   */
  iconLibrary?: string;
  /**
   * Custom icon size
   * @default 24
   */
  iconSize?: number;
  /**
   * Callback when the toast is pressed
   */
  onPress?: () => void;
  /**
   * Callback when the toast is closed
   */
  onClose?: () => void;
  /**
   * Whether to show the status bar when the toast is visible (Android only)
   * @default false
   */
  showStatusBar?: boolean;
  /**
   * The animation duration in milliseconds
   * @default 300
   */
  animationDuration?: number;
  /**
   * The number of lines to allow for the text
   * @default 2
   */
  numberOfLines?: number;
  /**
   * Whether to show a progress bar that indicates the remaining time
   * @default false
   */
  showProgress?: boolean;
  /**
   * The color of the progress bar
   * @default 'rgba(255, 255, 255, 0.7)'
   */
  progressColor?: string;
  /**
   * Test ID for testing purposes
   */
  testID?: string;
}

interface ToastProps extends ToastOptions {
  message: string;
  id: string;
  onHide: (id: string) => void;
}

// Default options for the toast
const defaultOptions: Required<Omit<ToastOptions, 'onClose' | 'onPress' | 'testID'>> = {
  type: 'default',
  position: 'top',
  duration: 3000,
  swipeToClose: true,
  offset: 16,
  style: {},
  textStyle: {},
  icon: '',
  iconLibrary: 'material-community',
  iconSize: 24,
  showStatusBar: false,
  animationDuration: 300,
  numberOfLines: 2,
  showProgress: false,
  progressColor: 'rgba(255, 255, 255, 0.7)',
};

// Toast colors based on type
const toastColors = {
  success: Theme.colors.success,
  error: Theme.colors.error,
  info: Theme.colors.info,
  warning: Theme.colors.warning,
  default: Theme.colors.primary,
};

// Default icons for each toast type
const toastIcons = {
  success: 'check-circle',
  error: 'alert-circle',
  info: 'information',
  warning: 'alert',
  default: 'bell',
};

/**
 * A single toast notification component.
 */
const Toast: React.FC<ToastProps> = ({
  message,
  id,
  onHide,
  type = defaultOptions.type,
  position = defaultOptions.position,
  duration = defaultOptions.duration,
  swipeToClose = defaultOptions.swipeToClose,
  offset = defaultOptions.offset,
  style,
  textStyle,
  icon = '',
  iconLibrary = defaultOptions.iconLibrary,
  iconSize = defaultOptions.iconSize,
  onPress,
  onClose,
  showStatusBar = defaultOptions.showStatusBar,
  animationDuration = defaultOptions.animationDuration,
  numberOfLines = defaultOptions.numberOfLines,
  showProgress = defaultOptions.showProgress,
  progressColor = defaultOptions.progressColor,
  testID = 'toast',
}) => {
  const insets = useSafeAreaInsets();
  const [isVisible, setIsVisible] = useState(true);
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    swipeToClose
      ? {
          onStartShouldSetPanResponder: () => true,
          onPanResponderRelease: (_, { dy }) => {
            if (Math.abs(dy) > 20) {
              hide();
            }
          },
        }
      : {}
  ).current;

  // Get the background color based on the toast type
  const backgroundColor = toastColors[type] || toastColors.default;
  
  // Determine the icon to display
  const toastIcon = icon || toastIcons[type] || toastIcons.default;

  // Show the toast with animation
  const show = useCallback(() => {
    setIsVisible(true);
    
    // Reset animations
    translateY.setValue(position === 'top' ? -100 : 100);
    opacity.setValue(0);
    progress.setValue(0);
    
    // Animate in
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: animationDuration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: animationDuration,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Animate progress bar if enabled
    if (showProgress && duration > 0) {
      Animated.timing(progress, {
        toValue: 1,
        duration,
        useNativeDriver: false,
      }).start();
    }
  }, [position, animationDuration, duration, showProgress, translateY, opacity, progress]);

  // Hide the toast with animation
  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: position === 'top' ? -100 : 100,
        duration: animationDuration,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: animationDuration,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      onClose?.();
      onHide(id);
    });
  }, [position, animationDuration, id, onHide, onClose, translateY, opacity]);

  // Auto-dismiss after duration
  useEffect(() => {
    show();
    
    if (duration > 0) {
      const timer = setTimeout(() => {
        hide();
      }, duration);
      
      return () => clearTimeout(timer);
    }
    
    return undefined;
  }, [duration, show, hide]);

  // Handle press
  const handlePress = () => {
    onPress?.();
    if (onPress) {
      hide();
    }
  };

  // Get the toast position styles
  const getPositionStyles = () => {
    const baseStyles = {
      position: 'absolute' as const,
      left: 16,
      right: 16,
      zIndex: 1000,
      elevation: 1000,
    };

    const positionMap = {
      top: {
        top: offset + insets.top,
      },
      bottom: {
        bottom: offset + insets.bottom,
      },
      center: {
        top: Dimensions.get('window').height / 2 - 50,
      },
    };

    return {
      ...baseStyles,
      ...positionMap[position],
    };
  };

  // Don't render if not visible
  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        getPositionStyles(),
        {
          backgroundColor,
          transform: [{ translateY }],
          opacity,
          borderRadius: Theme.borderRadius.md,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
        },
        style,
      ]}
      testID={testID}
      // @ts-ignore - PanResponder types are not properly inferred
      {...panResponder}
    >
      {showStatusBar && Platform.OS === 'android' && (
        <StatusBar backgroundColor={backgroundColor} />
      )}
      
      <TouchableOpacity
        activeOpacity={onPress ? 0.7 : 1}
        onPress={handlePress}
        style={styles.content}
      >
        <View style={styles.iconContainer}>
          <Icon
            name={toastIcon}
            library={iconLibrary}
            size={iconSize}
            color={Theme.colors.white}
          />
        </View>
        
        <Text
          style={[
            styles.text,
            { color: Theme.colors.white },
            textStyle,
          ]}
          numberOfLines={numberOfLines}
        >
          {message}
        </Text>
        
        {onPress && (
          <View style={styles.actionContainer}>
            <Icon
              name="chevron-right"
              library={iconLibrary}
              size={20}
              color={Theme.colors.white}
            />
          </View>
        )}
      </TouchableOpacity>
      
      {swipeToClose && (
        <TouchableOpacity
          onPress={hide}
          style={styles.closeButton}
          testID="toast-close-button"
        >
          <Icon
            name="close"
            library={iconLibrary}
            size={20}
            color={Theme.colors.white}
          />
        </TouchableOpacity>
      )}
      
      {showProgress && duration > 0 && (
        <Animated.View
          style={[
            styles.progressBar,
            {
              backgroundColor: progressColor,
              width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ['100%', '0%'],
              }),
            },
          ]}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  text: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  actionContainer: {
    marginLeft: 8,
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 2,
    borderBottomLeftRadius: Theme.borderRadius.md,
  },
});

export default Toast;
