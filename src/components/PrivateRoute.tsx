import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = useAuth();
  
  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // If user is an admin, redirect them to admin dashboard
  // This prevents admins from accessing regular user routes
  if (isAdmin) {
    return <Navigate to="/admin" />;
  }
  
  // Regular authenticated user
  return <>{children}</>;
}