import { renderHook, act } from '@testing-library/react-hooks';
import useOfflineQueue, { QueueItem } from '../hooks/useOfflineQueue';
import { checkIn } from '../api/checkIn';

jest.mock('../api/checkIn');

const mockCheckIn = checkIn as jest.Mock;

describe('useOfflineQueue', () => {
  it('enqueues items when offline and flushes when online', async () => {
    // NetInfo mocked to start offline
    let netInfoCb: any;
    const addEventListener = require('@react-native-community/netinfo').addEventListener;
    addEventListener.mockImplementation((cb: any) => {
      netInfoCb = cb;
      cb({ isConnected: false });
      return jest.fn();
    });

    const { result, waitFor } = renderHook(() => useOfflineQueue());

    const item: QueueItem = { id: '1', payload: { foo: 'bar' }, timestamp: Date.now() };

    act(() => {
      result.current.enqueue(item);
    });
    expect(result.current.queue).toHaveLength(1);
    expect(mockCheckIn).not.toHaveBeenCalled();

    // Simulate reconnect
    act(() => {
      netInfoCb({ isConnected: true });
    });

    await waitFor(() => expect(mockCheckIn).toHaveBeenCalledTimes(1));
    expect(mockCheckIn).toHaveBeenCalledWith(item.payload);
  });
});
