import { Navigate } from "react-router-dom";
import { useCurrentUser } from "@/hooks";
import { getAccessToken } from "@/lib/api";

interface RouteGuardProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: RouteGuardProps) {
  const token = getAccessToken();
  const { isLoading } = useCurrentUser();

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

  return <>{children}</>;
}

export function RedirectIfAuthenticated({ children }: RouteGuardProps) {
  const token = getAccessToken();

  if (token) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
