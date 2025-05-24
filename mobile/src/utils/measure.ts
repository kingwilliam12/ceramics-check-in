import { findNodeHandle, UIManager, Platform, NativeModules } from 'react-native';

/**
 * Measures a view's dimensions and position relative to the window
 * @param node The node to measure (can be a ref or a component instance)
 * @returns A promise that resolves to the layout measurements
 */
export const measureInWindow = async (node: any): Promise<{
  x: number;
  y: number;
  width: number;
  height: number;
  pageX: number;
  pageY: number;
} | null> => {
  try {
    const handle = findNodeHandle(node);
    if (!handle) return null;

    return new Promise((resolve) => {
      // Use measureInWindow for better performance on both platforms
      UIManager.measureInWindow(handle, (x, y, width, height) => {
        // On iOS, we can get the pageX/pageY from the native module
        if (Platform.OS === 'ios' && NativeModules.RNSScreen) {
          NativeModules.RNSScreen.getBoundingClientRect(handle, (rect: any) => {
            if (rect) {
              resolve({
                x,
                y,
                width,
                height,
                pageX: rect.x,
                pageY: rect.y,
              });
            } else {
              resolve({ x, y, width, height, pageX: x, pageY: y });
            }
          });
        } else {
          // On Android and web, pageX/pageY are the same as x/y
          resolve({ x, y, width, height, pageX: x, pageY: y });
        }
      });
    });
  } catch (error) {
    console.warn('Failed to measure component:', error);
    return null;
  }
};

/**
 * Measures a view's dimensions and position relative to its parent
 * @param node The node to measure (can be a ref or a component instance)
 * @param relativeToNativeNode The parent node to measure relative to
 * @returns A promise that resolves to the layout measurements
 */
export const measureLayout = async (
  node: any,
  relativeToNativeNode: any
): Promise<{
  x: number;
  y: number;
  width: number;
  height: number;
} | null> => {
  try {
    const handle = findNodeHandle(node);
    const relativeToHandle = findNodeHandle(relativeToNativeNode);
    
    if (!handle || !relativeToHandle) return null;

    return new Promise((resolve) => {
      UIManager.measureLayout(
        handle,
        relativeToHandle,
        (x, y, width, height) => {
          resolve({ x, y, width, height });
        },
        (error) => {
          console.warn('Failed to measure layout:', error);
          resolve(null);
        }
      );
    });
  } catch (error) {
    console.warn('Failed to measure layout:', error);
    return null;
  }
};

/**
 * Gets the window dimensions including safe area insets
 * @returns Object containing window dimensions and safe area insets
 */
export const getWindowDimensions = () => {
  const { width, height } = require('react-native').Dimensions.get('window');
  const insets = require('react-native-safe-area-context').useSafeAreaInsets();
  
  return {
    width,
    height,
    safeArea: {
      top: insets.top || 0,
      right: insets.right || 0,
      bottom: insets.bottom || 0,
      left: insets.left || 0,
    },
  };
};

export default {
  measureInWindow,
  measureLayout,
  getWindowDimensions,
};
