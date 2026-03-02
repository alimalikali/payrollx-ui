import { Navigate, useLocation } from "react-router-dom";
import { useCurrentUser } from "@/hooks";
import { getAccessToken } from "@/lib/api";
import { hasRole, type AppRole } from "@/lib/permissions";

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

const getDefaultHome = (role?: AppRole) => {
  if (role === "employee") {
    return "/employee/dashboard";
  }
  return "/hr/dashboard";
};

export function ProtectedRoute({ children, allowedRoles }: RouteGuardProps) {
  const token = getAccessToken();
  const location = useLocation();
  const { data: user, isLoading, isError } = useCurrentUser();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (isError || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRole(user, allowedRoles)) {
    return <Navigate to={getDefaultHome(user.role)} replace />;
  }

  const isPasswordChangeRoute = location.pathname === "/settings" || location.pathname === "/hr/settings";
  if (user.mustChangePassword && !isPasswordChangeRoute) {
    return <Navigate to="/settings" replace />;
  }

  return <>{children}</>;
}

export function RedirectIfAuthenticated({ children }: RouteGuardProps) {
  const token = getAccessToken();
  const { data: user } = useCurrentUser();

  if (token && user) {
    return <Navigate to={getDefaultHome(user.role)} replace />;
  }

  return <>{children}</>;
}

export function RoleHomeRedirect() {
  const token = getAccessToken();
  const { data: user, isLoading } = useCurrentUser();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  return <Navigate to={getDefaultHome(user?.role)} replace />;
}
