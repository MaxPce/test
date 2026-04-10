import { Navigate, useLocation, useParams } from "react-router-dom";
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
  const params = useParams();

  const { isAuthenticated, user, hasPermission, operatorPermissions } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasPermission(requiredRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (user?.role === "operator") {
    const eventId = params.eventId ?? params.externalEventId ?? params.idevent;
    const sportId = params.sportId ?? params.localSportId ?? params.externalSportId;

    const eventIdNum = eventId ? Number(eventId) : undefined;
    const sportIdNum = sportId ? Number(sportId) : undefined;

    if (eventIdNum !== undefined || sportIdNum !== undefined) {
      
      const permissions = operatorPermissions?.permissions ?? [];
      const eventIds = permissions.map((p) => p.eventId);
      const sportIds = permissions.map((p) => p.sportId).filter((id): id is number => id !== null);

      const hasResourceAccess =
        // Tiene acceso al evento
        (eventIdNum !== undefined && eventIds.includes(eventIdNum)) ||
        // O tiene acceso al deporte específico (sin eventId en URL)
        (eventIdNum === undefined && sportIdNum !== undefined && sportIds.includes(sportIdNum));

      if (!hasResourceAccess) {
        return <Navigate to="/unauthorized" replace />;
      }
    }
  }

  return <>{children}</>;
}