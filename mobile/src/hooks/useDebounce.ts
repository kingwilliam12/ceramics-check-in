import { useState, useEffect } from 'react';
import { debounce } from 'lodash';

/**
 * A custom hook that returns a debounced version of the input value.
 * The debounced value will only reflect the latest value when the specified delay has passed
 * without the debounced function being called.
 *
 * @param value - The value to be debounced
 * @param delay - The delay in milliseconds (default: 500ms)
 * @returns The debounced value
 */
const useDebounce = <T>(value: T, delay = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Update debounced value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel the timeout if value changes (also on delay change or unmount)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * A custom hook that returns a debounced version of the input function.
 * The debounced function will only be called after the specified delay has passed
 * without the debounced function being called.
 *
 * @param callback - The function to be debounced
 * @param delay - The delay in milliseconds (default: 500ms)
 * @param deps - Dependencies array for the callback function
 * @returns The debounced function
 */
const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay = 500,
  deps: React.DependencyList = []
): ((...args: Parameters<T>) => void) => {
  // Create a ref to store the latest callback
  const callbackRef = useLatest(callback);

  // Create the debounced function
  const debouncedFn = useMemo(
    () =>
      debounce((...args: Parameters<T>) => {
        callbackRef.current(...args);
      }, delay),
    [delay, ...deps]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedFn.cancel();
    };
  }, [debouncedFn]);

  return debouncedFn;
};

// Helper hook to always return the latest version of a value
const useLatest = <T>(value: T): React.MutableRefObject<T> => {
  const ref = useRef<T>(value);
  ref.current = value;
  return ref;
};

export { useDebounce, useDebouncedCallback };
