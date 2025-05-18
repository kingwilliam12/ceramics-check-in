import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import MemberForm from '../components/MemberForm';

const insertFn = jest.fn().mockResolvedValue({});
const updateFn = jest.fn(() => ({ eq: jest.fn().mockResolvedValue({}) }));

jest.mock('../lib/supabase', () => ({
  supabase: {
    from: () => ({ insert: insertFn, update: updateFn }),
  },
}));

describe('MemberForm', () => {
  it('inserts new member', async () => {
    const onSaved = jest.fn();
    render(<MemberForm onSaved={onSaved} />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'j@example.com' } });
    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => expect(insertFn).toHaveBeenCalled());
  });

  it('updates existing member', async () => {
    const member = { id: '1', full_name: 'Old', email: 'o@example.com' };
    render(<MemberForm member={member} />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'New' } });
    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => expect(updateFn).toHaveBeenCalled());
  });
});
