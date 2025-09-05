import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

import type { ProtectedRouteProps } from "../../lib/types";

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }


  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to appropriate dashboard based on role
    const redirectPath = user?.role === 'admin' ? '/dashboard' : `/employee/dashboard/${user?._id}`;
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
