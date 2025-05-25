import { useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { checkInServices } from '@services/supabase';
import { useAuth } from '@context/AuthContext';
import { Alert, Platform } from 'react-native';

// Types
export interface GeofenceConfig {
  center: {
    latitude: number;
    longitude: number;
  };
  radius: number;
  maxSessionHours: number;
}

// Default configuration
export const DEFAULT_GEOFENCE_CONFIG: GeofenceConfig = {
  center: {
    latitude: 59.3293,  // Default coordinates (Stockholm)
    longitude: 18.0686,
  },
  radius: 150, // meters
  maxSessionHours: 12, // Maximum session duration in hours
};

// Get geofence config from environment or use defaults
export const getGeofenceConfig = (): GeofenceConfig => {
  // In a real app, you might get these from environment variables or a config service
  return {
    ...DEFAULT_GEOFENCE_CONFIG,
    // Override with environment variables if they exist
    radius: process.env.GEOFENCE_RADIUS 
      ? Number(process.env.GEOFENCE_RADIUS) 
      : DEFAULT_GEOFENCE_CONFIG.radius,
    maxSessionHours: process.env.MAX_SESSION_HOURS
      ? Number(process.env.MAX_SESSION_HOURS)
      : DEFAULT_GEOFENCE_CONFIG.maxSessionHours,
  };
};

// Get the current config
const config = getGeofenceConfig();

export const GEOFENCE_RADIUS = config.radius;
export const GEOFENCE_CENTER = config.center;
export const MAX_SESSION_HOURS = config.maxSessionHours;

// Background task name
export const GEOFENCE_TASK = 'background-geofence-task';

// Define the payload type for the geofence event
type GeofenceEvent = {
  eventType: Location.GeofencingEventType;
  region: Location.LocationRegion;
  location: Location.LocationObject;
};

// Register the background task
TaskManager.defineTask<{ eventType: Location.GeofencingEventType }>(
  GEOFENCE_TASK,
  async ({ data: { eventType }, error }) => {
    if (error) {
      console.error('Geofencing task error:', error);
      return;
    }

    // Handle geofence events
    if (eventType === Location.GeofencingEventType.Exit) {
      // We'll handle the exit event in the hook
    }
  }
);

export const useBackgroundGeofence = (onGeofenceExit: () => Promise<void>) => {
  const { user } = useAuth();
  const isMonitoringRef = useRef(false);
  const exitCountRef = useRef(0);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const EXIT_THRESHOLD = 3; // Number of consecutive exits before triggering auto-checkout
  const CHECK_INTERVAL = 5 * 60 * 1000; // Check session duration every 5 minutes

  // Request necessary permissions
  const requestPermissions = useCallback(async () => {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    
    if (foregroundStatus !== 'granted') {
      Alert.alert(
        'Location Permission Required',
        'Location permission is required for geofencing functionality.',
        [{ text: 'OK' }]
      );
      return false;
    }

    if (Platform.OS !== 'web') {
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      
      if (backgroundStatus !== 'granted') {
        Alert.alert(
          'Background Location Permission Required',
          'Background location permission is required for geofencing to work when the app is in the background.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }

    return true;
  }, []);

  // Check if session has exceeded max duration
  const checkSessionDuration = useCallback(async () => {
    if (sessionTimerRef.current) {
      clearTimeout(sessionTimerRef.current);
    }

    // Schedule next check
    sessionTimerRef.current = setTimeout(() => {
      checkSessionDuration();
    }, CHECK_INTERVAL);

    // Check if session has exceeded max duration
    try {
      const currentCheckIn = await checkInServices.getCurrentCheckIn(user?.id || '');
      if (currentCheckIn?.data) {
        const checkInTime = new Date(currentCheckIn.data.created_at).getTime();
        const currentTime = new Date().getTime();
        const hoursElapsed = (currentTime - checkInTime) / (1000 * 60 * 60);

        if (hoursElapsed >= MAX_SESSION_HOURS) {
          await onGeofenceExit();
          Alert.alert(
            'Session Ended',
            `Your session has exceeded the maximum duration of ${MAX_SESSION_HOURS} hours. You have been automatically checked out.`,
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Error checking session duration:', error);
    }
  }, [user?.id, onGeofenceExit]);

  // Initialize geofencing
  const startGeofencing = useCallback(async () => {
    // Start session duration check
    checkSessionDuration();
    
    // Start geofencing
    return await _startGeofencing();
  }, [checkSessionDuration]);
  
  // Internal geofencing start function
  const _startGeofencing = useCallback(async () => {
    if (isMonitoringRef.current) return;

    const hasPermission = await requestPermissions();
    if (!hasPermission) return false;

    try {
      // Stop any existing geofencing
      await Location.stopGeofencingAsync(GEOFENCE_TASK);

      // Start geofencing
      await Location.startGeofencingAsync(GEOFENCE_TASK, [
        {
          identifier: 'studio_location',
          latitude: GEOFENCE_CENTER.latitude,
          longitude: GEOFENCE_CENTER.longitude,
          radius: GEOFENCE_RADIUS,
          notifyOnEnter: true,
          notifyOnExit: true,
        },
      ]);

      isMonitoringRef.current = true;
      return true;
    } catch (error) {
      console.error('Error starting geofencing:', error);
      return false;
    }
  }, [requestPermissions]);

  // Stop geofencing
  const stopGeofencing = useCallback(async () => {
    if (!isMonitoringRef.current) return;

    try {
      await Location.stopGeofencingAsync(GEOFENCE_TASK);
      isMonitoringRef.current = false;
      return true;
    } catch (error) {
      console.error('Error stopping geofencing:', error);
      return false;
    }
  }, []);

  // Handle geofence exit
  const handleGeofenceExit = useCallback(async () => {
    if (!user?.id) return;

    exitCountRef.current++;
    
    // Only trigger auto-checkout after threshold is reached
    if (exitCountRef.current >= EXIT_THRESHOLD) {
      try {
        // Call the provided callback (which will handle the check-out)
        await onGeofenceExit();
        exitCountRef.current = 0; // Reset counter after successful check-out
      } catch (error) {
        console.error('Error during auto-checkout:', error);
      }
    } else {
      // Notify user they're leaving the geofence
      Alert.alert(
        'Leaving Studio Area',
        `You're leaving the studio area. You'll be automatically checked out after ${EXIT_THRESHOLD - exitCountRef.current} more exit events.`,
        [{ text: 'OK' }]
      );
    }
  }, [user?.id, onGeofenceExit]);

  // Set up event listener for geofence events
  useEffect(() => {
    const subscription = Location.watchPositionAsync(
      { distanceInterval: 10 }, // Update every 10 meters
      (location) => {
        // This is just to keep the location service active
        // The actual geofence events are handled by the background task
      }
    );

    // Set up listener for geofence events
    const eventSubscription = Location.addGeofencingListener(({ eventType, region, location }) => {
      if (eventType === Location.GeofencingEventType.Exit) {
        handleGeofenceExit();
      }
    });

    return () => {
      subscription.then((sub) => sub.remove());
      eventSubscription.remove();
      stopGeofencing();
    };
  }, [handleGeofenceExit, stopGeofencing]);

  return {
    startGeofencing,
    stopGeofencing,
    isMonitoring: isMonitoringRef.current,
  };
};

export default useBackgroundGeofence;
