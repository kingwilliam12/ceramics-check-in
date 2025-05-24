import React, { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

type RoleBasedRouteProps = {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
};

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  allowedRoles,
  children,
  fallback = null,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // Show a loading indicator while checking auth status
    return <>{fallback}</>;
  }

  // Check if user has one of the allowed roles
  const hasRequiredRole = user?.role && allowedRoles.includes(user.role);

  if (!hasRequiredRole) {
    // User doesn't have the required role, show fallback or null
    return <>{fallback}</>;
  }

  // User has the required role, render the children
  return <>{children}</>;
};

// Helper components for common role checks
export const AdminRoute: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({
  children,
  fallback,
}) => (
  <RoleBasedRoute allowedRoles={['admin']} fallback={fallback}>
    {children}
  </RoleBasedRoute>
);

export const StaffRoute: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({
  children,
  fallback,
}) => (
  <RoleBasedRoute allowedRoles={['admin', 'staff']} fallback={fallback}>
    {children}
  </RoleBasedRoute>
);

export const MemberRoute: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({
  children,
  fallback,
}) => (
  <RoleBasedRoute allowedRoles={['admin', 'staff', 'member']} fallback={fallback}>
    {children}
  </RoleBasedRoute>
);
