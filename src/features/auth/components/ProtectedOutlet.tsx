// src/features/auth/components/ProtectedOutlet.tsx  ← CREAR
import { Outlet } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import type { UserRole } from "@/lib/types/common.types";

interface Props {
  requiredRoles: UserRole[];
}

export function ProtectedOutlet({ requiredRoles }: Props) {
  return (
    <ProtectedRoute requiredRoles={requiredRoles}>
      <Outlet />
    </ProtectedRoute>
  );
}