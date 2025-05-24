import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Modal as RNModal,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
  Easing,
  Platform,
  StyleProp,
  ViewStyle,
  BackHandler,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  StatusBarStyle,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '@constants/theme';
import Text from '../Text';
import Button from '../Button';
import Icon from '../Icon';

type ModalPosition = 'center' | 'bottom' | 'top' | 'left' | 'right';
type ModalAnimationType = 'fade' | 'slide' | 'none';
type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | number | string;

export interface ModalProps {
  /**
   * Whether the modal is visible
   * @default false
   */
  visible: boolean;
  /**
   * Callback when the modal is closed
   */
  onClose: () => void;
  /**
   * The title of the modal
   */
  title?: string;
  /**
   * The subtitle of the modal
   */
  subtitle?: string;
  /**
   * The content of the modal
   */
  children: React.ReactNode;
  /**
   * Whether to show the close button
   * @default true
   */
  showCloseButton?: boolean;
  /**
   * The position of the modal
   * @default 'center'
   */
  position?: ModalPosition;
  /**
   * The animation type
   * @default 'fade'
   */
  animationType?: ModalAnimationType;
  /**
   * The size of the modal
   * @default 'md'
   */
  size?: ModalSize;
  /**
   * Whether to close the modal when clicking the backdrop
   * @default true
   */
  closeOnBackdropPress?: boolean;
  /**
   * Whether to close the modal when pressing the back button (Android only)
   * @default true
   */
  closeOnBackButtonPress?: boolean;
  /**
   * Whether to show the modal in full screen
   * @default false
   */
  fullScreen?: boolean;
  /**
   * Whether to make the modal scrollable
   * @default false
   */
  scrollable?: boolean;
  /**
   * Whether to avoid the keyboard
   * @default true
   */
  avoidKeyboard?: boolean;
  /**
   * The behavior for the keyboard avoiding view (iOS only)
   * @default 'padding'
   */
  keyboardBehavior?: 'padding' | 'position' | 'height';
  /**
   * Custom styles for the modal container
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Custom styles for the modal content
   */
  contentStyle?: StyleProp<ViewStyle>;
  /**
   * Custom styles for the modal header
   */
  headerStyle?: StyleProp<ViewStyle>;
  /**
   * Custom styles for the modal footer
   */
  footerStyle?: StyleProp<ViewStyle>;
  /**
   * The footer content
   */
  footer?: React.ReactNode;
  /**
   * Whether to show the footer divider
   * @default true
   */
  showFooterDivider?: boolean;
  /**
   * The status bar style when the modal is open
   * @default 'light-content'
   */
  statusBarStyle?: StatusBarStyle;
  /**
   * The background color of the overlay
   * @default 'rgba(0, 0, 0, 0.5)'
   */
  overlayColor?: string;
  /**
   * The animation duration in milliseconds
   * @default 300
   */
  animationDuration?: number;
  /**
   * The z-index of the modal
   * @default 1000
   */
  zIndex?: number;
  /**
   * Test ID for testing purposes
   */
  testID?: string;
}

/**
 * A customizable modal component with various animations and positions.
 */
const Modal: React.FC<ModalProps> = ({
  visible = false,
  onClose,
  title,
  subtitle,
  children,
  showCloseButton = true,
  position = 'center',
  animationType = 'fade',
  size = 'md',
  closeOnBackdropPress = true,
  closeOnBackButtonPress = true,
  fullScreen = false,
  scrollable = false,
  avoidKeyboard = true,
  keyboardBehavior = 'padding',
  style,
  contentStyle,
  headerStyle,
  footerStyle,
  footer,
  showFooterDivider = true,
  statusBarStyle = 'light-content',
  overlayColor = 'rgba(0, 0, 0, 0.5)',
  animationDuration = 300,
  zIndex = 1000,
  testID = 'modal',
}) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const animation = useRef(new Animated.Value(0)).current;
  const [isVisible, setIsVisible] = useState(visible);
  const [isMounted, setIsMounted] = useState(false);

  // Handle back button press (Android)
  useEffect(() => {
    if (!closeOnBackButtonPress || Platform.OS !== 'android') return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (visible) {
        onClose();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [closeOnBackButtonPress, onClose, visible]);

  // Handle visibility changes
  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      setIsMounted(true);
      Animated.timing(animation, {
        toValue: 1,
        duration: animationDuration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: animationDuration,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setIsVisible(false);
        setIsMounted(false);
      });
    }
  }, [visible, animation, animationDuration]);

  // Get the modal size based on the size prop
  const getModalSize = useCallback(() => {
    if (fullScreen) {
      return {
        width: windowWidth,
        height: windowHeight,
        maxHeight: windowHeight,
        maxWidth: windowWidth,
        borderRadius: 0,
      };
    }

    if (typeof size === 'number') {
      return {
        width: size,
        maxWidth: '90%',
        maxHeight: '90%',
        borderRadius: Theme.borderRadius.lg,
      };
    }

    if (typeof size === 'string' && size.endsWith('%')) {
      const percentage = parseFloat(size) / 100;
      return {
        width: windowWidth * percentage,
        height: windowHeight * percentage,
        maxWidth: '90%',
        maxHeight: '90%',
        borderRadius: Theme.borderRadius.lg,
      };
    }

    const sizeMap = {
      xs: { width: windowWidth * 0.8, maxWidth: 400 },
      sm: { width: windowWidth * 0.9, maxWidth: 500 },
      md: { width: windowWidth * 0.9, maxWidth: 600 },
      lg: { width: windowWidth * 0.95, maxWidth: 800 },
      xl: { width: windowWidth * 0.98, maxWidth: 1000 },
      full: { width: windowWidth, height: windowHeight, maxWidth: windowWidth, maxHeight: windowHeight, borderRadius: 0 },
    };

    return {
      ...(sizeMap[size as keyof typeof sizeMap] || sizeMap.md),
      maxHeight: '90%',
      borderRadius: Theme.borderRadius.lg,
    };
  }, [fullScreen, size, windowWidth, windowHeight]);

  // Get the modal position styles
  const getPositionStyles = useCallback(() => {
    const modalSize = getModalSize();
    const baseStyles = {
      position: 'absolute',
      backgroundColor: Theme.colors.surface,
      ...modalSize,
    };

    const positionMap = {
      center: {
        top: (windowHeight - (modalSize.height || 0)) / 2,
        left: (windowWidth - (modalSize.width as number)) / 2,
        transform: [
          {
            translateY: animation.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          },
        ],
      },
      bottom: {
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: Theme.borderRadius.xl,
        borderTopRightRadius: Theme.borderRadius.xl,
        transform: [
          {
            translateY: animation.interpolate({
              inputRange: [0, 1],
              outputRange: [windowHeight * 0.3, 0],
            }),
          },
        ],
      },
      top: {
        top: 0,
        left: 0,
        right: 0,
        borderBottomLeftRadius: Theme.borderRadius.xl,
        borderBottomRightRadius: Theme.borderRadius.xl,
        transform: [
          {
            translateY: animation.interpolate({
              inputRange: [0, 1],
              outputRange: [-windowHeight * 0.3, 0],
            }),
          },
        ],
      },
      left: {
        top: 0,
        left: 0,
        bottom: 0,
        borderTopRightRadius: Theme.borderRadius.xl,
        borderBottomRightRadius: Theme.borderRadius.xl,
        transform: [
          {
            translateX: animation.interpolate({
              inputRange: [0, 1],
              outputRange: [-windowWidth * 0.8, 0],
            }),
          },
        ],
      },
      right: {
        top: 0,
        right: 0,
        bottom: 0,
        borderTopLeftRadius: Theme.borderRadius.xl,
        borderBottomLeftRadius: Theme.borderRadius.xl,
        transform: [
          {
            translateX: animation.interpolate({
              inputRange: [0, 1],
              outputRange: [windowWidth * 0.8, 0],
            }),
          },
        ],
      },
    };

    return {
      ...baseStyles,
      ...positionMap[position],
      opacity: animationType === 'fade' ? animation : 1,
    };
  }, [position, animation, animationType, getModalSize, windowWidth, windowHeight]);

  // Handle backdrop press
  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      onClose();
    }
  };

  // Render the modal header
  const renderHeader = () => {
    if (!title && !subtitle && !showCloseButton) return null;

    return (
      <View style={[styles.header, headerStyle]}>
        <View style={styles.headerContent}>
          {title && <Text variant="h6" style={styles.title}>{title}</Text>}
          {subtitle && (
            <Text variant="body2" color="textSecondary" style={styles.subtitle}>
              {subtitle}
            </Text>
          )}
        </View>
        {showCloseButton && (
          <Button
            variant="ghost"
            size="sm"
            onPress={onClose}
            icon="close"
            iconSize={20}
            style={styles.closeButton}
            testID="modal-close-button"
          />
        )}
      </View>
    );
  };

  // Render the modal footer
  const renderFooter = () => {
    if (!footer) return null;

    return (
      <>
        {showFooterDivider && <Divider />}
        <View style={[styles.footer, footerStyle]}>{footer}</View>
      </>
    );
  };

  // Render the modal content
  const renderContent = () => {
    const content = (
      <View style={[styles.content, contentStyle]}>
        {children}
      </View>
    );

    if (scrollable) {
      return (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      );
    }

    return content;
  };

  // Don't render anything if the modal is not visible and not mounted
  if (!isVisible && !isMounted) return null;

  // Get the modal container styles
  const modalContainerStyle = [
    styles.container,
    getPositionStyles(),
    style,
    { zIndex },
  ] as StyleProp<ViewStyle>;

  // Get the overlay styles
  const overlayStyle = [
    styles.overlay,
    {
      backgroundColor: overlayColor,
      opacity: animationType === 'fade' ? animation : 1,
    },
  ] as StyleProp<ViewStyle>;

  // The main modal content
  const modalContent = (
    <View style={modalContainerStyle}>
      {renderHeader()}
      {renderContent()}
      {renderFooter()}
    </View>
  );

  // Wrap with KeyboardAvoidingView if needed
  const wrappedContent = avoidKeyboard ? (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? keyboardBehavior : undefined}
      style={styles.keyboardAvoidingView}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 20 : 0}
    >
      {modalContent}
    </KeyboardAvoidingView>
  ) : (
    modalContent
  );

  return (
    <RNModal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={closeOnBackButtonPress ? onClose : undefined}
      statusBarTranslucent
      testID={testID}
    >
      <StatusBar barStyle={statusBarStyle} translucent backgroundColor="transparent" />
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <Animated.View style={overlayStyle} />
      </TouchableWithoutFeedback>
      <View style={styles.wrapper} pointerEvents="box-none">
        {wrappedContent}
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
    elevation: 24,
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  header: {
    padding: Theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Theme.colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    marginRight: Theme.spacing.sm,
  },
  title: {
    marginBottom: Theme.spacing.xs,
  },
  subtitle: {
    marginBottom: 0,
  },
  closeButton: {
    marginLeft: 'auto',
  },
  content: {
    padding: Theme.spacing.md,
  },
  scrollView: {
    maxHeight: '70%',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  footer: {
    padding: Theme.spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Theme.colors.border,
  },
});

export default Modal;
