import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus, NetInfo, NetInfoState } from 'react-native';

interface AppStateHook {
  appState: AppStateStatus;
  isForeground: boolean;
  isConnected: boolean | null;
  connectionType: string | null;
}

/**
 * A custom hook that tracks the app's state (foreground/background) and network status.
 * 
 * @returns An object containing the current app state and network information
 */
const useAppState = (): AppStateHook => {
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const [isForeground, setIsForeground] = useState<boolean>(true);
  const [networkState, setNetworkState] = useState<{
    isConnected: boolean | null;
    connectionType: string | null;
  }>({
    isConnected: null,
    connectionType: null,
  });

  // Handle app state changes (foreground/background)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      setAppState(nextAppState);
      setIsForeground(nextAppState === 'active');
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  // Handle network state changes
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setNetworkState({
        isConnected: state.isConnected,
        connectionType: state.type,
      });
    });

    // Fetch initial network state
    const fetchInitialNetworkState = async () => {
      const state = await NetInfo.fetch();
      setNetworkState({
        isConnected: state.isConnected,
        connectionType: state.type,
      });
    };

    fetchInitialNetworkState();

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    appState,
    isForeground,
    isConnected: networkState.isConnected,
    connectionType: networkState.connectionType,
  };
};

export default useAppState;
