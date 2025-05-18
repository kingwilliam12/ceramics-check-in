import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import RoleGuard from '../components/RoleGuard';

const replaceMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

let sessionRole = 'admin';

jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: () =>
        Promise.resolve({
          data: { session: { user: { user_metadata: { role: sessionRole } } } },
        }),
    },
  },
}));

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  // @ts-ignore
  console.error.mockRestore();
});

describe('RoleGuard', () => {
  it('renders children when user has admin role', async () => {
    sessionRole = 'admin';
    await act(async () => {
      render(
        <RoleGuard requiredRole="admin">
          <div data-testid="child">ok</div>
        </RoleGuard>,
      );
    });
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it('redirects when user lacks role', async () => {
    sessionRole = 'member';
    await act(async () => {
      render(
        <RoleGuard requiredRole="admin">
          <div>forbidden</div>
        </RoleGuard>,
      );
    });
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/403'));
  });
});
