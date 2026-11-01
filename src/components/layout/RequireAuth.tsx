import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../state/AuthContext';

interface RequireAuthProps {
  children: ReactNode;
  role?: 'staff' | 'admin';
}

export function RequireAuth({ children, role }: RequireAuthProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }

  if (role === 'admin' && user.role !== 'admin') {
    return <Navigate to={user.role === 'manager' ? '/manager' : '/account'} replace />;
  }

  if (role === 'staff' && user.role !== 'manager' && user.role !== 'admin') {
    return <Navigate to="/account" replace />;
  }

  return <>{children}</>;
}
