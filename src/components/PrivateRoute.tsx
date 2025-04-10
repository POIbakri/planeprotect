import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isLoading } = useAuth();
  
  // Wait for auth state to load
  if (isLoading) {
    return null; // Or a loading component
  }
  
  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If user is an admin, redirect them to admin dashboard
  // This prevents admins from accessing regular user routes
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }
  
  // Regular authenticated user
  return <>{children}</>;
}