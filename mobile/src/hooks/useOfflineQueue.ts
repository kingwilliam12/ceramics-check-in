import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { v4 as uuidv4 } from 'uuid';
import { checkInServices } from '@services/supabase';
import { useAuth } from '@context/AuthContext';

type QueueItem = {
  id: string;
  type: 'CHECK_IN' | 'CHECK_OUT';
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  status: 'PENDING' | 'SYNCING' | 'COMPLETED' | 'FAILED';
  retryCount: number;
  lastError?: string;
  metadata?: Record<string, unknown>;
};

const QUEUE_STORAGE_KEY = '@check_in_queue';
const MAX_RETRIES = 3;
const MAX_QUEUE_SIZE = 25; // As per requirements

const useOfflineQueue = () => {
  const { user } = useAuth();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const isProcessing = useRef(false);

  // Load queue from storage on mount
  useEffect(() => {
    const loadQueue = async () => {
      try {
        const savedQueue = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
        if (savedQueue) {
          setQueue(JSON.parse(savedQueue));
        }
      } catch (error) {
        console.error('Failed to load queue from storage:', error);
      }
    };

    loadQueue();
  }, []);

  // Save queue to storage whenever it changes
  useEffect(() => {
    const saveQueue = async () => {
      try {
        await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
      } catch (error) {
        console.error('Failed to save queue to storage:', error);
      }
    };

    saveQueue();
  }, [queue]);

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasOffline = !isOnline;
      setIsOnline(state.isConnected ?? false);
      
      // If we just came back online, process the queue
      if (wasOffline && state.isConnected) {
        processQueue();
      }
    });

    return () => unsubscribe();
  }, [isOnline]);

  // Add an item to the queue
  const enqueue = useCallback(async (
    type: 'CHECK_IN' | 'CHECK_OUT',
    location?: { latitude: number; longitude: number },
    metadata?: Record<string, unknown>
  ): Promise<QueueItem> => {
    if (queue.length >= MAX_QUEUE_SIZE) {
      throw new Error('Queue is full. Please sync before adding more items.');
    }

    const newItem: QueueItem = {
      id: uuidv4(),
      type,
      timestamp: new Date().toISOString(),
      location,
      status: 'PENDING',
      retryCount: 0,
      metadata
    };

    setQueue(prev => [...prev, newItem]);
    
    // If online, try to process immediately
    if (isOnline) {
      processQueue();
    }

    return newItem;
  }, [queue, isOnline]);

  // Process the queue
  const processQueue = useCallback(async () => {
    // Prevent multiple processing instances
    if (isProcessing.current) return;
    if (!isOnline) return;
    
    const pendingItems = queue.filter(item => item.status === 'PENDING' || item.status === 'FAILED');
    if (pendingItems.length === 0) return;

    isProcessing.current = true;

    try {
      // Process items in order
      for (const item of pendingItems) {
        try {
          // Update status to SYNCING
          updateItemStatus(item.id, 'SYNCING');
          
          // Execute the appropriate action
          if (item.type === 'CHECK_IN') {
            await checkInServices.checkIn(
              user?.id || '',
              item.location?.latitude || 0,
              item.location?.longitude || 0
            );
          } else {
            await checkInServices.checkOut(user?.id || '');
          }
          
          // Mark as completed
          updateItemStatus(item.id, 'COMPLETED');
          
        } catch (error) {
          console.error(`Failed to process ${item.type}:`, error);
          const retryCount = (item.retryCount || 0) + 1;
          const shouldRetry = retryCount <= MAX_RETRIES;
          
          updateItemStatus(
            item.id,
            shouldRetry ? 'FAILED' : 'COMPLETED',
            error instanceof Error ? error.message : 'Unknown error',
            retryCount
          );
          
          if (shouldRetry) {
            // Exponential backoff for retries
            const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 30000);
            setTimeout(processQueue, backoffTime);
            break;
          }
        }
      }
    } finally {
      isProcessing.current = false;
    }
  }, [queue, isOnline, user?.id]);

  // Update an item's status
  const updateItemStatus = useCallback((id: string, status: QueueItem['status'], error?: string, retryCount?: number) => {
    setQueue(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              status,
              ...(error !== undefined && { lastError: error }),
              ...(retryCount !== undefined && { retryCount })
            }
          : item
      )
    );
  }, []);

  // Clear completed items
  const clearCompleted = useCallback(async () => {
    setQueue(prev => prev.filter(item => item.status !== 'COMPLETED'));
  }, []);

  // Get current queue status
  const getQueueStatus = useCallback(() => {
    const pending = queue.filter(item => item.status === 'PENDING' || item.status === 'FAILED');
    return {
      total: queue.length,
      pending: pending.length,
      isProcessing: isProcessing.current,
      isOnline
    };
  }, [queue, isOnline]);

  return {
    enqueue,
    processQueue,
    clearCompleted,
    getQueueStatus,
    queue,
    isOnline
  };
};

export default useOfflineQueue;
