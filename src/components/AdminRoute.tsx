import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isLoading } = useAuth();

  // While authentication is loading, show nothing to prevent flashing
  if (isLoading) {
    return null;
  }
  
  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // If logged in but not admin, redirect to dashboard
  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }
  
  // User is logged in and is an admin
  return <>{children}</>;
}