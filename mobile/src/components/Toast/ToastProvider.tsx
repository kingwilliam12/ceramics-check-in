import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Toast, { ToastOptions } from './Toast';

interface ToastConfig extends ToastOptions {
  id: string;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, options?: ToastOptions) => void;
  hideToast: (id: string) => void;
  hideAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * A provider component that allows showing toast notifications throughout the app.
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastConfig[]>([]);
  const toastCount = useRef(0);

  // Show a toast with the given message and options
  const showToast = useCallback((message: string, options: ToastOptions = {}) => {
    const id = `toast-${Date.now()}-${toastCount.current++}`;
    
    setToasts(prevToasts => [
      ...prevToasts,
      {
        id,
        message,
        ...options,
      },
    ]);
    
    return id;
  }, []);

  // Hide a specific toast by ID
  const hideToast = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  // Hide all toasts
  const hideAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Handle when a toast is closed
  const handleToastHide = useCallback((id: string) => {
    hideToast(id);
  }, [hideToast]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast, hideAllToasts }}>
      {children}
      <View style={styles.container} pointerEvents="box-none">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            onHide={handleToastHide}
            {...toast}
          />
        ))}
      </View>
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    elevation: 1000,
    pointerEvents: 'box-none',
  },
});

/**
 * Hook to access the toast context
 * @returns Toast context with showToast, hideToast, and hideAllToasts methods
 */
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastProvider;
