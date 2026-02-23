import { Navigate } from "react-router-dom";
import { useCurrentUser } from "@/hooks";
import { getAccessToken } from "@/lib/api";

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: Array<"admin" | "hr" | "employee">;
}

const getDefaultHome = (role?: "admin" | "hr" | "employee") => {
  if (role === "employee") return "/employee/dashboard";
  return "/hr/dashboard";
};

export function ProtectedRoute({ children, allowedRoles }: RouteGuardProps) {
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

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultHome(user.role)} replace />;
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
