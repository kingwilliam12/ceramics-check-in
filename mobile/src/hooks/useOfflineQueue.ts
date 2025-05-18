import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { checkIn } from '../api/checkIn';

const STORAGE_KEY = 'offlineQueue';

export interface QueueItem {
  id: string;
  payload: unknown;
  timestamp: number;
}

export default function useOfflineQueue() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isOnline, setIsOnline] = useState(true);

  // Load on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setQueue(JSON.parse(raw));
      } catch (err) {
        console.warn('Failed to load queue', err);
      }
    })();
  }, []);

  // Persist when queue changes
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue)).catch(err => {
      console.warn('Failed to persist queue', err);
    });
  }, [queue]);

  // Monitor connectivity
  useEffect(() => {
    const sub = NetInfo.addEventListener(state => setIsOnline(Boolean(state.isConnected)));
    return () => sub();
  }, []);

  // Drain when back online
  useEffect(() => {
    if (!isOnline || queue.length === 0) return;
    (async () => {
      const first = queue[0];
      try {
        await checkIn(first.payload);
        dequeue();
      } catch (err) {
        console.warn('Failed to flush queue item', err);
      }
    })();
  }, [isOnline, queue]);

  const enqueue = useCallback((item: QueueItem) => {
    setQueue(q => [...q, item]);
  }, []);

  const dequeue = useCallback(() => {
    let item: QueueItem | undefined;
    setQueue(q => {
      item = q[0];
      return q.slice(1);
    });
    return item;
  }, []);

  const clear = useCallback(() => setQueue([]), []);

  return { queue, enqueue, dequeue, clear };
}
