import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { toast } from 'sonner';

/**
 * Hook to enforce role-based access control
 * Redirects to dashboard if user doesn't have required role
 */
export function useRequireRole(requiredRole: UserRole) {
  const { hasRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !hasRole(requiredRole)) {
      toast.error('Você não tem permissão para acessar esta página');
      navigate('/dashboard');
    }
  }, [hasRole, requiredRole, loading, navigate]);

  return { hasRole: hasRole(requiredRole), loading };
}

/**
 * Hook to check if user has any of the required roles
 */
export function useRequireAnyRole(requiredRoles: UserRole[]) {
  const { roles, loading } = useAuth();
  const navigate = useNavigate();

  const hasAnyRole = requiredRoles.some(role => roles.includes(role));

  useEffect(() => {
    if (!loading && !hasAnyRole) {
      toast.error('Você não tem permissão para acessar esta página');
      navigate('/dashboard');
    }
  }, [hasAnyRole, loading, navigate]);

  return { hasAnyRole, loading };
}
