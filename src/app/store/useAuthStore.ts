import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserRole } from "@/lib/types/common.types";
import type { OperatorPermissionSummary } from "@/features/admin/types/operator-permission.types";

export interface User {
  userId: number;
  username: string;
  fullName: string;
  role: UserRole;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  operatorPermissions: OperatorPermissionSummary | null;
}

interface AuthActions {
  setAuth: (token: string, user: User) => void;
  setOperatorPermissions: (permissions: OperatorPermissionSummary | null) => void;
  clearOperatorPermissions: () => void;
  logout: () => void;
  hasPermission: (requiredRoles: UserRole[]) => boolean;
  isAdmin: () => boolean;
  isModerator: () => boolean;
  isOperator: () => boolean;
  canAccessSport: (sportId: number, eventId?: number) => boolean;
  canAccessEvent: (eventId: number) => boolean;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      operatorPermissions: null,

      setAuth: (token, user) =>
        set({
          token,
          user,
          isAuthenticated: true,
        }),

      setOperatorPermissions: (permissions) =>
        set({
          operatorPermissions: permissions,
        }),

      clearOperatorPermissions: () =>
        set({
          operatorPermissions: null,
        }),

      logout: () =>
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          operatorPermissions: null,
        }),

      hasPermission: (requiredRoles) => {
        const { user } = get();
        return user ? requiredRoles.includes(user.role) : false;
      },

      isAdmin: () => {
        const { user } = get();
        return user?.role === "admin";
      },

      isModerator: () => {
        const { user } = get();
        return user?.role === "admin" || user?.role === "moderator";
      },

      isOperator: () => {
        const { user } = get();
        return user?.role === "operator";
      },

      canAccessSport: (sportId, eventId?) => {
        const { user, operatorPermissions } = get();
        if (!user) return false;
        if (user.role === "admin" || user.role === "moderator") return true;
        if (user.role !== "operator") return false;
        if (!operatorPermissions) return false;

        return operatorPermissions.permissions.some((p) => {
          if (eventId !== undefined) {
            if (p.eventId !== eventId) return false;
            if (p.sportId === null) return true;   
            return p.sportId === sportId;           
          }
          return p.sportId === sportId;
        });
      },


      canAccessEvent: (eventId) => {
        const { user, operatorPermissions } = get();
        if (!user) return false;
        if (user.role === "admin" || user.role === "moderator") return true;
        if (user.role !== "operator") return false;
        if (!operatorPermissions) return false;

        return operatorPermissions.permissions.some((p) => p.eventId === eventId);
      },

    }),
    {
      name: "formatosoft-auth",
    }
  )
);