import { UserRole } from '../types';

/**
 * Check if the user has the required role or higher
 * @param userRole The user's role
 * @param requiredRole The minimum required role
 * @returns boolean indicating if the user has the required role
 */
export const hasRole = (userRole: UserRole | undefined, requiredRole: UserRole): boolean => {
  if (!userRole) return false;
  
  const roleHierarchy: Record<UserRole, number> = {
    'admin': 3,
    'staff': 2,
    'member': 1,
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

/**
 * Check if the user has any of the specified roles
 * @param userRole The user's role
 * @param allowedRoles Array of allowed roles
 * @returns boolean indicating if the user has any of the allowed roles
 */
export const hasAnyRole = (
  userRole: UserRole | undefined, 
  allowedRoles: UserRole[]
): boolean => {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
};

/**
 * Check if the user is an admin
 * @param userRole The user's role
 * @returns boolean indicating if the user is an admin
 */
export const isAdmin = (userRole: UserRole | undefined): boolean => {
  return userRole === 'admin';
};

/**
 * Check if the user is staff or admin
 * @param userRole The user's role
 * @returns boolean indicating if the user is staff or admin
 */
export const isStaffOrAdmin = (userRole: UserRole | undefined): boolean => {
  return userRole === 'admin' || userRole === 'staff';
};

/**
 * Check if the user can edit a resource
 * @param user The current user
 * @param resourceOwnerId The ID of the resource owner
 * @returns boolean indicating if the user can edit the resource
 */
export const canEditResource = (
  user: { id: string; role: UserRole } | null,
  resourceOwnerId: string
): boolean => {
  if (!user) return false;
  return user.id === resourceOwnerId || isAdmin(user.role);
};

/**
 * Check if the user can delete a resource
 * @param user The current user
 * @param resourceOwnerId The ID of the resource owner
 * @returns boolean indicating if the user can delete the resource
 */
export const canDeleteResource = (
  user: { id: string; role: UserRole } | null,
  resourceOwnerId: string
): boolean => {
  if (!user) return false;
  return user.id === resourceOwnerId || isAdmin(user.role);
};

/**
 * Get the highest role from an array of roles
 * @param roles Array of roles
 * @returns The highest role or undefined if no roles provided
 */
export const getHighestRole = (roles: UserRole[]): UserRole | undefined => {
  if (roles.length === 0) return undefined;
  
  const roleHierarchy: Record<UserRole, number> = {
    'admin': 3,
    'staff': 2,
    'member': 1,
  };
  
  return roles.reduce((highest, current) => {
    return roleHierarchy[current] > (roleHierarchy[highest] || 0) ? current : highest;
  }, roles[0]);
};
