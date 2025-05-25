import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { withRetry, showNetworkError } from '@utils/network';
import useBackgroundGeofence, { GEOFENCE_RADIUS } from '@hooks/useBackgroundGeofence';
import { checkInServices } from '@services/checkIn';
import useOfflineQueue from '@hooks/useOfflineQueue';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@components/Text';
import { theme } from '@constants/theme';
import { checkInServices, locationServices } from '@services/supabase';
import { useAuth } from '@context/AuthContext';
import { CheckInStatus, SwipeCheckInProps, SwipeCheckInRef } from './types';

const SwipeCheckIn = forwardRef<SwipeCheckInRef, SwipeCheckInProps>(({ 
  onStatusChange, 
  initialStatus = 'checked-out',
  style,
  showStatusText = true,
  showTimer = true 
}, ref) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<CheckInStatus>('loading');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const [sessionDuration, setSessionDuration] = useState<string>('00:00:00');
  const [geofenceEnabled, setGeofenceEnabled] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  
  // Initialize offline queue with state tracking
  const { enqueue, processQueue, getQueueStatus } = useOfflineQueue();
  const [queueStatus, setQueueStatus] = useState({
    pending: 0,
    isSyncing: false,
    isOnline: true
  });
  
  // Update queue status when it changes
  useEffect(() => {
    const status = getQueueStatus();
    setQueueStatus(prev => ({
      ...prev,
      pending: status.pending,
      isOnline: status.isOnline,
      isSyncing: status.isProcessing
    }));
  }, [getQueueStatus]);
  
  // Process any pending items in the queue
  const processPendingItems = useCallback(async () => {
    const status = getQueueStatus();
    if (status.pending > 0 && status.isOnline) {
      setIsSyncing(true);
      try {
        await processQueue();
      } finally {
        setIsSyncing(false);
      }
    }
  }, [getQueueStatus, processQueue]);

  // Check current check-in status
  const checkCurrentStatus = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data: currentCheckIn, error: checkInError } = await checkInServices.getCurrentCheckIn(user.id);
      
      if (checkInError) throw checkInError;
      
      if (currentCheckIn) {
        setStatus('checked-in');
        setSessionStart(new Date(currentCheckIn.created_at));
      } else {
        setStatus('checked-out');
      }
    } catch (err) {
      console.error('Error checking status:', err);
      setStatus('error');
      setError('Failed to load check-in status');
    }
  }, [user?.id]);

  // Request location permissions and get current location
  const requestLocation = useCallback(async () => {
    try {
      const { granted } = await locationServices.requestPermissions();
      if (!granted) {
        setError('Location permission is required for check-in');
        setStatus('error');
        return;
      }

      const { location: currentLocation, error: locationError } = await locationServices.getCurrentLocation();
      if (locationError || !currentLocation) {
        throw new Error('Could not get current location');
      }

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (err) {
      console.error('Location error:', err);
      setError('Location access is required for check-in');
      setStatus('error');
    }
  }, []);

  // Update session timer
  const updateSessionTimer = useCallback(() => {
    if (!sessionStart) return;
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - sessionStart.getTime()) / 1000);
    
    const hours = Math.floor(diffInSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((diffInSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (diffInSeconds % 60).toString().padStart(2, '0');
    
    setSessionDuration(`${hours}:${minutes}:${seconds}`);
  }, [sessionStart]);

  // Handle check-in with offline support
  const handleCheckIn = useCallback(async () => {
    if (!user?.id) {
      setError('User not authenticated');
      setStatus('error');
      return;
    }

    if (!location) {
      Alert.alert('Error', 'Location is required for check-in');
      return;
    }

    try {
      setStatus('loading');
      
      // Use the retry mechanism for the check-in operation
      const { error: checkInError } = await withRetry(async () => {
        const result = await checkInServices.checkIn(
          user.id,
          location.latitude,
          location.longitude
        );
        return result;
      });

      if (checkInError) throw new Error(checkInError.message || 'Failed to check in');

      // Process any pending items in the queue
      await processPendingItems();
      
      // Update UI on success
      setStatus('checked-in');
      setSessionStart(new Date());
      onStatusChange?.('checked-in');
      
    } catch (err) {
      console.error('Check-in error:', err);
      const error = err instanceof Error ? err : new Error('Failed to check in');
      setError(error.message);
      setStatus('error');
      onStatusChange?.('error');
      showNetworkError(error);
      
      // Revert to previous status if check-in fails
      setTimeout(() => {
        checkCurrentStatus();
      }, 2000);
    }
  });

  // Handle check-out with retry mechanism
  const handleCheckOut = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      setStatus('error');
      return;
    }

    try {
      setStatus('loading');
      
      // Use the retry mechanism for the check-out operation
      const { error: checkOutError } = await withRetry(() => 
        checkInServices.checkOut(user!.id)
      );

      if (checkOutError) throw new Error(checkOutError.message || 'Failed to check out');

      // Process any pending items in the queue
      await processPendingItems();
      
      // Update UI on success
      setStatus('checked-out');
      setSessionStart(null);
      onStatusChange?.('checked-out');
      
    } catch (err) {
      console.error('Check-out error:', err);
      const error = err instanceof Error ? err : new Error('Failed to check out');
      setError(error.message);
      setStatus('error');
      onStatusChange?.('error');
      showNetworkError(error);
      
      // Revert to previous status if check-out fails
      setTimeout(() => {
        checkCurrentStatus();
      }, 2000);
    }
  }, [user?.id, onStatusChange, checkCurrentStatus]);

  // Handle check-in/out based on current status
  const handleCheckInOut = useCallback(async () => {
    if (status === 'checked-out') {
      await handleCheckIn();
    } else if (status === 'checked-in') {
      await handleCheckOut();
    }
  }, [status, handleCheckIn, handleCheckOut]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    checkIn: handleCheckIn,
    checkOut: handleCheckOut,
    getStatus: () => status,
  }));

  // Update status when initialStatus prop changes
  useEffect(() => {
    if (initialStatus && initialStatus !== status && status !== 'loading') {
      setStatus(initialStatus);
    }
  }, [initialStatus, status]);

  // Update session timer when checked in
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (status === 'checked-in' && sessionStart) {
      updateSessionTimer();
      interval = setInterval(updateSessionTimer, 1000);
    }
    
    return () => clearInterval(interval);
  }, [status, sessionStart]);

  // Process any pending items when component mounts or network status changes
  useEffect(() => {
    processPendingItems();
  }, [processPendingItems]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (geofenceEnabled) {
        stopGeofencing();
      }
    };
  }, [geofenceEnabled]);

  const isCheckedIn = status === 'checked-in';
  const buttonText = isCheckedIn ? 'Slide to Check Out' : 'Slide to Check In';
  const buttonColor = isCheckedIn ? theme.colors.secondary : theme.colors.primary;

  return (
    <View style={[styles.container, style]}>
      {/* Offline/Syncing Indicator */}
      {!queueStatus.isOnline && (
        <View style={styles.offlineContainer}>
          <Ionicons name="cloud-offline" size={16} color={theme.colors.warning} />
          <Text style={styles.offlineText}>Offline - Changes will sync when back online</Text>
        </View>
      )}
      
      {queueStatus.pending > 0 && (
        <View style={styles.syncContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.syncText}>
            {queueStatus.isSyncing 
              ? 'Syncing...' 
              : `${queueStatus.pending} pending ${queueStatus.pending === 1 ? 'change' : 'changes'}`}
          </Text>
        </View>
      )}
      {showStatusText && (
        <View style={styles.statusContainer}>
          <View style={[styles.statusIndicator, isCheckedIn ? styles.checkedIn : styles.checkedOut]} />
          <Text style={styles.statusText}>
            {isCheckedIn ? 'Currently checked in' : 'Currently checked out'}
          </Text>
        </View>
      )}

      {isCheckedIn && sessionStart && showTimer && (
        <View style={styles.timerContainer}>
          <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.timerText}>{sessionDuration}</Text>
        </View>
      )}

      <View style={styles.swipeButtonContainer}>
        <SwipeButton
          disabled={false}
          height={60}
          width={'100%'}
          title={buttonText}
          titleFontSize={16}
          titleColor="#fff"
          thumbIconImageSource={require('@assets/arrow-right.png')}
          onSwipeSuccess={handleCheckInOut}
          railFillBackgroundColor={buttonColor}
          railFillBorderColor="transparent"
          thumbIconBackgroundColor="#fff"
          thumbIconBorderColor="#fff"
          railBackgroundColor="#e0e0e0"
          railBorderColor="transparent"
          containerStyles={styles.swipeButton}
        />
      </View>
    </View>
  );
});

// Add display name for better debugging
SwipeCheckIn.displayName = 'SwipeCheckIn';

export { SwipeCheckIn };

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: theme.colors.errorBackground,
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 10,
  },
  swipeButton: {
    borderRadius: 25,
    height: 50,
  },
  swipeButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  errorIcon: {
    marginRight: 10,
  },
  errorText: {
    color: theme.colors.error,
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  checkedIn: {
    backgroundColor: theme.colors.success,
  },
  checkedOut: {
    backgroundColor: theme.colors.secondary,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  offlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: 8,
    borderRadius: 4,
    marginBottom: 10,
  },
  offlineText: {
    marginLeft: 5,
    color: theme.colors.warning,
    fontSize: 12,
  },
  syncContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  syncText: {
    marginLeft: 5,
    color: theme.colors.text,
    fontSize: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.errorLight,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  checkedIn: {
    backgroundColor: theme.colors.success,
  },
  checkedOut: {
    backgroundColor: theme.colors.textSecondary,
  },
  statusText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timerText: {
    marginLeft: 8,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  swipeButtonContainer: {
    width: '100%',
    marginTop: 8,
  },
  swipeButton: {
    borderRadius: 30,
    overflow: 'hidden',
  },
});
