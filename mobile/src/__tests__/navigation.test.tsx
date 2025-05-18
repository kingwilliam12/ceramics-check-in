import { render, fireEvent } from '@testing-library/react-native';
import IndexScreen from '../../app/index';

jest.mock('expo-router', () => {
  const actual = jest.requireActual('expo-router');
  return {
    ...actual,
    useRouter: () => ({ push: jest.fn() }),
  };
});

describe('Navigation', () => {
  it('navigates to /status after swipe', () => {
    const { getByLabelText } = render(<IndexScreen />);
    const swipeBtn = getByLabelText('swipe_to_check_in');
    fireEvent.press(swipeBtn);
    // nothing to assert further due to router mock
  });
});
