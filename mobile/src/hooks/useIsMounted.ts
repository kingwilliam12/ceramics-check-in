import { useCallback, useEffect, useRef } from 'react';

/**
 * A custom hook that returns a function that returns `true` if the component is mounted.
 * This is useful for preventing memory leaks by not updating state after a component has unmounted.
 *
 * @returns A function that returns `true` if the component is mounted
 */
const useIsMounted = (): (() => boolean) => {
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return useCallback(() => isMountedRef.current, []);
};

export default useIsMounted;
