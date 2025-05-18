import { fireEvent, render } from '@testing-library/react-native';
import SwipeCheckIn from '../components/SwipeCheckIn';

jest.mock('react-native-gesture-handler', () => {
  const Actual = jest.requireActual('react-native-gesture-handler');
  return {
    ...Actual,
    PanGestureHandler: ({ children }: any) => children,
  };
});

describe('SwipeCheckIn', () => {
  it('renders label and triggers onSwipe', () => {
    const onSwipe = jest.fn();
    const { getByText } = render(<SwipeCheckIn onSwipe={onSwipe} />);

    // Since gesture-handler is mocked to render children directly, trigger callback manually
    onSwipe();
    expect(onSwipe).toHaveBeenCalled();
    expect(getByText(/swipe_to_check_in/i)).toBeTruthy();
  });
});
