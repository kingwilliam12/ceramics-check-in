import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'offlineQueue';

export interface QueueItem {
  id: string;
  payload: unknown;
  timestamp: number;
}

export default function useOfflineQueue() {
  const [queue, setQueue] = useState<QueueItem[]>([]);

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
