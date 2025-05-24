import { useEffect, useRef } from 'react';

/**
 * A custom hook that returns the previous value of a variable.
 * This is useful for comparing the current value with the previous value in a useEffect.
 *
 * @param value - The value to track
 * @returns The previous value
 */
const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

export default usePrevious;
