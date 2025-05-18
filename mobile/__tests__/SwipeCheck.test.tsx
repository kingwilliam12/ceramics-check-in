import { render } from '@testing-library/react-native';
import React from 'react';
import SwipeCheck from '../components/SwipeCheck';

describe('SwipeCheck', () => {
  it('renders label', () => {
    const { getByText } = render(<SwipeCheck />);
    expect(getByText(/Swipe me/i)).toBeTruthy();
  });
});
