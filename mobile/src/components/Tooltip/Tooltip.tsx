import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
  ReactElement,
  cloneElement,
  useMemo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
  Easing,
  StyleProp,
  ViewStyle,
  TextStyle,
  LayoutChangeEvent,
  Dimensions,
  Platform,
  I18nManager,
  ScrollView,
  LayoutRectangle,
  StatusBar,
  useWindowDimensions,
  TouchableOpacity,
  ViewToken,
  findNodeHandle,
  UIManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '@constants/theme';
import { measureInWindow } from '@utils/measure';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'auto';
type TooltipAnimationType = 'fade' | 'zoom' | 'slide' | 'none';
type TooltipTrigger = 'press' | 'longPress' | 'hover' | 'manual';

export interface TooltipProps {
  /**
   * The content to display in the tooltip
   */
  content: ReactNode;
  /**
   * The component that will trigger the tooltip
   */
  children: ReactElement;
  /**
   * Whether the tooltip is visible (controlled mode)
   */
  visible?: boolean;
  /**
   * Callback when the tooltip visibility changes
   */
  onVisibleChange?: (visible: boolean) => void;
  /**
   * The position of the tooltip relative to the target
   * @default 'top'
   */
  position?: TooltipPosition;
  /**
   * The animation type
   * @default 'fade'
   */
  animationType?: TooltipAnimationType;
  /**
   * The duration of the animation in milliseconds
   * @default 200
   */
  animationDuration?: number;
  /**
   * The background color of the tooltip
   * @default Theme.colors.surface
   */
  backgroundColor?: string;
  /**
   * The text color of the tooltip
   * @default Theme.colors.text
   */
  textColor?: string;
  /**
   * The width of the tooltip
   */
  width?: number;
  /**
   * The maximum width of the tooltip
   * @default 200
   */
  maxWidth?: number;
  /**
   * The height of the tooltip
   */
  height?: number;
  /**
   * The padding of the tooltip content
   * @default 8
   */
  padding?: number;
  /**
   * The border radius of the tooltip
   * @default 4
   */
  borderRadius?: number;
  /**
   * The offset between the tooltip and the target
   * @default 8
   */
  offset?: number;
  /**
   * The size of the arrow
   * @default 8
   */
  arrowSize?: number;
  /**
   * Whether to show the arrow
   * @default true
   */
  showArrow?: boolean;
  /**
   * The event that triggers the tooltip
   * @default 'press'
   */
  trigger?: TooltipTrigger;
  /**
   * Whether the tooltip is disabled
   * @default false
   */
  disabled?: boolean;
  /**
   * Whether the tooltip should close when the user taps outside
   * @default true
   */
  closeOnOutsidePress?: boolean;
  /**
   * Whether the tooltip should close when the user scrolls
   * @default true
   */
  closeOnScroll?: boolean;
  /**
   * Custom styles for the tooltip container
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Custom styles for the tooltip content
   */
  contentStyle?: StyleProp<ViewStyle>;
  /**
   * Custom styles for the tooltip text
   */
  textStyle?: StyleProp<TextStyle>;
  /**
   * Custom styles for the arrow
   */
  arrowStyle?: StyleProp<ViewStyle>;
  /**
   * The z-index of the tooltip
   * @default 1000
   */
  zIndex?: number;
  /**
   * The elevation of the tooltip (Android only)
   * @default 4
   */
  elevation?: number;
  /**
   * The shadow color of the tooltip
   * @default '#000'
   */
  shadowColor?: string;
  /**
   * The shadow opacity of the tooltip
   * @default 0.3
   */
  shadowOpacity?: number;
  /**
   * The shadow radius of the tooltip
   * @default 6
   */
  shadowRadius?: number;
  /**
   * The shadow offset of the tooltip
   * @default { width: 0, height: 2 }
   */
  shadowOffset?: { width: number; height: number };
  /**
   * Callback when the tooltip is shown
   */
  onShow?: () => void;
  /**
   * Callback when the tooltip is hidden
   */
  onHide?: () => void;
  /**
   * Test ID for testing purposes
   */
  testID?: string;
}

const ARROW_SIZE = 8;
const OFFSET = 8;
const MAX_WIDTH = 200;
const PADDING = 8;
const BORDER_RADIUS = 4;
const ANIMATION_DURATION = 200;

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  visible: propVisible,
  onVisibleChange,
  position: propPosition = 'top',
  animationType = 'fade',
  animationDuration = ANIMATION_DURATION,
  backgroundColor = Theme.colors.surface,
  textColor = Theme.colors.text,
  width,
  maxWidth = MAX_WIDTH,
  height,
  padding = PADDING,
  borderRadius = BORDER_RADIUS,
  offset = OFFSET,
  arrowSize = ARROW_SIZE,
  showArrow = true,
  trigger = 'press',
  disabled = false,
  closeOnOutsidePress = true,
  closeOnScroll = true,
  style,
  contentStyle,
  textStyle,
  arrowStyle,
  zIndex = 1000,
  elevation = 4,
  shadowColor = '#000',
  shadowOpacity = 0.3,
  shadowRadius = 6,
  shadowOffset = { width: 0, height: 2 },
  onShow,
  onHide,
  testID = 'tooltip',
}) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [isVisible, setIsVisible] = useState(propVisible || false);
  const [position, setPosition] = useState<TooltipPosition>(propPosition);
  const [tooltipLayout, setTooltipLayout] = useState<LayoutRectangle | null>(null);
  const [targetLayout, setTargetLayout] = useState<LayoutRectangle | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const targetRef = useRef<View>(null);
  const tooltipRef = useRef<View>(null);
  const isControlled = propVisible !== undefined;
  const isRTL = I18nManager.isRTL;

  // Update visibility when prop changes
  useEffect(() => {
    if (isControlled && propVisible !== isVisible) {
      if (propVisible) {
        show();
      } else {
        hide();
      }
    }
  }, [propVisible]);

  // Handle scroll events
  useEffect(() => {
    if (!closeOnScroll || !isVisible) return;

    const handleScroll = () => {
      hide();
    };

    // Use passive event listener for better performance
    const options = { passive: true, capture: true };
    document.addEventListener('scroll', handleScroll, options);
    
    return () => {
      document.removeEventListener('scroll', handleScroll, options);
    };
  }, [closeOnScroll, isVisible]);

  // Measure the target element
  const measureTarget = useCallback(async () => {
    if (!targetRef.current) return null;

    try {
      const handle = findNodeHandle(targetRef.current);
      if (!handle) return null;

      return new Promise<LayoutRectangle>((resolve) => {
        UIManager.measure(handle, (x, y, width, height, pageX, pageY) => {
          resolve({ x: pageX, y: pageY, width, height });
        });
      });
    } catch (error) {
      console.warn('Failed to measure target:', error);
      return null;
    }
  }, []);

  // Calculate the best position for the tooltip
  const calculatePosition = useCallback(
    async (targetLayout: LayoutRectangle, tooltipLayout: LayoutRectangle) => {
      if (propPosition !== 'auto') return propPosition;

      const positions: TooltipPosition[] = ['top', 'right', 'bottom', 'left'];
      const availableSpace = {
        top: targetLayout.y - insets.top - arrowSize - offset,
        right: windowWidth - (targetLayout.x + targetLayout.width) - offset,
        bottom: windowHeight - (targetLayout.y + targetLayout.height) - insets.bottom - offset,
        left: targetLayout.x - offset,
      };

      // Find the first position with enough space
      for (const pos of positions) {
        if (pos === 'top' || pos === 'bottom') {
          if (availableSpace[pos] >= tooltipLayout.height) {
            return pos;
          }
        } else {
          if (availableSpace[pos] >= tooltipLayout.width) {
            return pos;
          }
        }
      }


      // Default to top if no position has enough space
      return 'top';
    },
    [insets, offset, propPosition, windowWidth, windowHeight, arrowSize]
  );

  // Show the tooltip
  const show = useCallback(async () => {
    if (disabled || isVisible) return;

    // Measure the target
    const target = await measureTarget();
    if (!target) return;

    // Set initial layout
    setTargetLayout(target);
    
    // Force a layout pass to measure the tooltip
    setTimeout(() => {
      if (!tooltipRef.current) return;
      
      tooltipRef.current.measureInWindow((x, y, width, height) => {
        if (width === 0 || height === 0) return;
        
        const tooltipLayout = { x, y, width, height };
        setTooltipLayout(tooltipLayout);
        
        // Calculate the best position
        calculatePosition(target, tooltipLayout).then((pos) => {
          setPosition(pos);
          
          // Update state and animate in
          setIsMounted(true);
          setIsVisible(true);
          onVisibleChange?.(true);
          onShow?.();
          
          Animated.timing(animation, {
            toValue: 1,
            duration: animationDuration,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }).start();
        });
      });
    }, 0);
  }, [
    disabled,
    isVisible,
    measureTarget,
    calculatePosition,
    animation,
    animationDuration,
    onVisibleChange,
    onShow,
  ]);

  // Hide the tooltip
  const hide = useCallback(() => {
    if (!isVisible) return;

    Animated.timing(animation, {
      toValue: 0,
      duration: animationDuration,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
      setIsMounted(false);
      onVisibleChange?.(false);
      onHide?.();
    });
  }, [animation, animationDuration, isVisible, onHide, onVisibleChange]);

  // Toggle the tooltip
  const toggle = useCallback(() => {
    if (isVisible) {
      hide();
    } else {
      show();
    }
  }, [isVisible, show, hide]);

  // Handle press events based on trigger
  const handlePress = useCallback(() => {
    if (trigger === 'press') {
      toggle();
    }
  }, [trigger, toggle]);

  const handleLongPress = useCallback(() => {
    if (trigger === 'longPress') {
      toggle();
    }
  }, [trigger, toggle]);

  // Render the arrow
  const renderArrow = useCallback(() => {
    if (!showArrow || !targetLayout) return null;

    const arrowStyle: any = {
      position: 'absolute',
      width: 0,
      height: 0,
      backgroundColor: 'transparent',
      borderStyle: 'solid',
      borderLeftWidth: arrowSize,
      borderRightWidth: arrowSize,
      borderTopWidth: arrowSize,
      borderBottomWidth: arrowSize,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderTopColor: 'transparent',
      borderBottomColor: 'transparent',
    };

    const arrowPosition: any = {};
    const arrowOffset = arrowSize / 2;

    switch (position) {
      case 'top':
        arrowPosition.bottom = -arrowSize * 2;
        arrowPosition.left = (targetLayout.width - arrowSize * 2) / 2;
        arrowStyle.borderTopColor = backgroundColor;
        break;
      case 'bottom':
        arrowPosition.top = -arrowSize * 2;
        arrowPosition.left = (targetLayout.width - arrowSize * 2) / 2;
        arrowStyle.borderBottomColor = backgroundColor;
        break;
      case 'left':
        arrowPosition.right = -arrowSize * 2;
        arrowPosition.top = (targetLayout.height - arrowSize * 2) / 2;
        arrowStyle.borderLeftColor = backgroundColor;
        break;
      case 'right':
        arrowPosition.left = -arrowSize * 2;
        arrowPosition.top = (targetLayout.height - arrowSize * 2) / 2;
        arrowStyle.borderRightColor = backgroundColor;
        break;
    }

    return (
      <View
        style={[
          styles.arrow,
          arrowStyle,
          arrowPosition,
          arrowStyle,
        ]}
        pointerEvents="none"
      />
    );
  }, [position, targetLayout, backgroundColor, showArrow, arrowSize]);

  // Calculate tooltip position
  const getTooltipPosition = useCallback(() => {
    if (!targetLayout || !tooltipLayout) return {};

    const styles: any = {};
    const tooltipWidth = width || Math.min(maxWidth, windowWidth - offset * 2);
    const tooltipHeight = height || 'auto';

    // Calculate horizontal position
    if (position === 'left' || position === 'right') {
      styles.width = tooltipWidth;
      styles.height = tooltipHeight;
      
      if (position === 'left') {
        styles.right = windowWidth - targetLayout.x + offset;
      } else {
        styles.left = targetLayout.x + targetLayout.width + offset;
      }
      
      // Center vertically
      styles.top = targetLayout.y + (targetLayout.height - (typeof tooltipHeight === 'number' ? tooltipHeight : targetLayout.height)) / 2;
    } else {
      // Top or bottom
      styles.width = tooltipWidth;
      styles.height = tooltipHeight;
      
      // Center horizontally
      styles.left = targetLayout.x + (targetLayout.width - tooltipWidth) / 2;
      
      if (position === 'top') {
        styles.bottom = windowHeight - targetLayout.y + offset;
      } else {
        styles.top = targetLayout.y + targetLayout.height + offset;
      }
    }

    // Adjust for RTL
    if (isRTL) {
      if (styles.left !== undefined) {
        styles.right = windowWidth - (styles.left + (styles.width || 0));
        delete styles.left;
      } else if (styles.right !== undefined) {
        styles.left = windowWidth - (styles.right + (styles.width || 0));
        delete styles.right;
      }
    }

    // Ensure tooltip stays within screen bounds
    if (styles.left !== undefined && styles.left < offset) {
      styles.left = offset;
    } else if (styles.right !== undefined && styles.right < offset) {
      styles.right = offset;
    }

    // Ensure tooltip doesn't go off the right side of the screen
    if (styles.left !== undefined && styles.left + (styles.width || 0) > windowWidth - offset) {
      styles.left = windowWidth - (styles.width || 0) - offset;
    } else if (styles.right !== undefined && styles.right + (styles.width || 0) > windowWidth - offset) {
      styles.right = offset;
    }

    return styles;
  }, [position, targetLayout, tooltipLayout, width, height, maxWidth, offset, windowWidth, windowHeight, isRTL]);

  // Animation styles
  const getAnimationStyle = useCallback(() => {
    const animationStyles: any = {
      opacity: animation,
      transform: [],
    };

    if (animationType === 'zoom') {
      animationStyles.transform.push({
        scale: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 1],
        }),
      });
    } else if (animationType === 'slide') {
      switch (position) {
        case 'top':
          animationStyles.transform.push({
            translateY: animation.interpolate({
              inputRange: [0, 1],
              outputRange: [10, 0],
            }),
          });
          break;
        case 'bottom':
          animationStyles.transform.push({
            translateY: animation.interpolate({
              inputRange: [0, 1],
              outputRange: [-10, 0],
            }),
          });
          break;
        case 'left':
          animationStyles.transform.push({
            translateX: animation.interpolate({
              inputRange: [0, 1],
              outputRange: [10, 0],
            }),
          });
          break;
        case 'right':
          animationStyles.transform.push({
            translateX: animation.interpolate({
              inputRange: [0, 1],
              outputRange: [-10, 0],
            }),
          });
          break;
      }
    }

    return animationStyles;
  }, [animation, animationType, position]);

  // Clone the child element with the necessary props
  const wrappedChild = useMemo(() => {
    if (!React.isValidElement(children)) return children;

    const childProps: any = {
      ref: (node: any) => {
        // Keep the ref to the original element
        // @ts-ignore
        targetRef.current = node;
        
        // Call the original ref if it exists
        if (children && typeof children.ref === 'function') {
          children.ref(node);
        } else if (children && children.ref) {
          children.ref.current = node;
        }
      },
    };

    // Add event handlers based on the trigger
    if (trigger === 'press' || trigger === 'longPress') {
      if (trigger === 'press') {
        childProps.onPress = handlePress;
      } else if (trigger === 'longPress') {
        childProps.onLongPress = handleLongPress;
      }
    } else if (trigger === 'hover') {
      // For web
      childProps.onMouseEnter = show;
      childProps.onMouseLeave = hide;
      
      // For mobile
      childProps.onPressIn = show;
      childProps.onPressOut = hide;
    }

    return cloneElement(children, childProps);
  }, [children, trigger, handlePress, handleLongPress, show, hide]);

  // Don't render anything if the tooltip is not mounted
  if (!isMounted) {
    return wrappedChild;
  }

  return (
    <>
      {wrappedChild}
      {isVisible && (
        <>
          {closeOnOutsidePress && (
            <TouchableWithoutFeedback onPress={hide} testID="tooltip-backdrop">
              <View style={styles.backdrop} />
            </TouchableWithoutFeedback>
          )}
          <Animated.View
            ref={tooltipRef}
            style={[
              styles.tooltip,
              {
                backgroundColor,
                borderRadius,
                padding,
                zIndex,
                elevation,
                shadowColor,
                shadowOpacity,
                shadowRadius,
                shadowOffset,
                ...getTooltipPosition(),
                ...getAnimationStyle(),
              },
              style,
            ]}
            testID={testID}
            onLayout={({ nativeEvent }) => {
              if (!tooltipLayout) {
                setTooltipLayout(nativeEvent.layout);
              }
            }}
          >
            {typeof content === 'string' ? (
              <Text
                style={[
                  styles.text,
                  { color: textColor },
                  textStyle,
                ]}
                numberOfLines={0}
              >
                {content}
              </Text>
            ) : (
              <View style={contentStyle}>{content}</View>
            )}
            {renderArrow()}
          </Animated.View>
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  tooltip: {
    position: 'absolute',
    maxWidth: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
      },
    }),
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  arrow: {
    position: 'absolute',
  },
});

export default Tooltip;
