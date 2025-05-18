import { useEffect } from 'react';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { isInsideGeofence } from '../utils/geofence';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkIn } from '../api/checkIn';

const TASK_NAME = 'background-geofence';
const TARGET_POINT = { latitude: 55.6761, longitude: 12.5683 }; // Copenhagen example

TaskManager.defineTask(TASK_NAME, async ({ data, error, executionInfo }) => {
  if (error) {
    console.error('Geofence task error', error);
    return;
  }
  const { locations } = data as any;
  if (!locations?.length) return;
  const loc = locations[0];
  if (isInsideGeofence({ latitude: loc.coords.latitude, longitude: loc.coords.longitude }, TARGET_POINT)) {
    console.log('🔔 Inside geofence');
    const payload = { lat: loc.coords.latitude, lon: loc.coords.longitude, ts: Date.now() };
    try {
      await checkIn(payload);
    } catch (err) {
      // enqueue offline
      const STORAGE_KEY = 'offlineQueue';
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const queue = raw ? JSON.parse(raw) : [];
      queue.push({ id: String(Date.now()), payload, timestamp: Date.now() });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    }
  }
});

export default function useBackgroundGeofence() {
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
      if (bgStatus === 'granted') {
        await Location.startLocationUpdatesAsync(TASK_NAME, {
          accuracy: Location.Accuracy.High,
          distanceInterval: 50,
          showsBackgroundLocationIndicator: false,
          deferredUpdatesInterval: 60_000,
        });
      }
    })();
  }, []);
}
