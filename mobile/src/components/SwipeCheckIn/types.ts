import { StyleProp, ViewStyle } from 'react-native';

export type CheckInStatus = 'checked-in' | 'checked-out';

export interface SwipeCheckInProps {
  /**
   * Callback function that is called when the check-in/out status changes
   * @param status - The new check-in status
   */
  onStatusChange?: (status: CheckInStatus) => void;
  
  /**
   * Initial status of the check-in button
   * @default 'checked-out'
   */
  initialStatus?: CheckInStatus;
  
  /**
   * Custom styles for the container
   */
  style?: StyleProp<ViewStyle>;
  
  /**
   * Whether to show the status text
   * @default true
   */
  showStatusText?: boolean;
  
  /**
   * Whether to show the session timer
   * @default true
   */
  showTimer?: boolean;
}

export interface SwipeCheckInRef {
  /**
   * Manually trigger check-in
   */
  checkIn: () => Promise<void>;
  
  /**
   * Manually trigger check-out
   */
  checkOut: () => Promise<void>;
  
  /**
   * Get the current check-in status
   */
  getStatus: () => Promise<CheckInStatus>;
}
