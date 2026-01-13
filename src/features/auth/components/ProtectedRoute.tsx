import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/app/store/useAuthStore";
import type { UserRole } from "@/lib/types/common.types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

export function ProtectedRoute({
  children,
  requiredRoles = ["admin", "moderator", "viewer"],
}: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, hasPermission } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasPermission(requiredRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
