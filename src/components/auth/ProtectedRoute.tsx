
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: ('investor' | 'employee')[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified, check if user has the required role
  if (allowedRoles && user) {
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
  }

  // If everything is fine, render the children
  return <Outlet />;
};

export default ProtectedRoute;
