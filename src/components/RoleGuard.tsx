import { ReactNode } from 'react';
import { useAuth, UserRole } from '@/contexts/AuthContext';

interface RoleGuardProps {
  children: ReactNode;
  requiredRole: UserRole;
  fallback?: ReactNode;
}

/**
 * Component to conditionally render content based on user role
 * Use this for UI elements that should only be visible to certain roles
 */
export function RoleGuard({ children, requiredRole, fallback = null }: RoleGuardProps) {
  const { hasRole, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!hasRole(requiredRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface AnyRoleGuardProps {
  children: ReactNode;
  requiredRoles: UserRole[];
  fallback?: ReactNode;
}

/**
 * Component to conditionally render content if user has any of the required roles
 */
export function AnyRoleGuard({ children, requiredRoles, fallback = null }: AnyRoleGuardProps) {
  const { roles, loading } = useAuth();

  if (loading) {
    return null;
  }

  const hasAnyRole = requiredRoles.some(role => roles.includes(role));

  if (!hasAnyRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
