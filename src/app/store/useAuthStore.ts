import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserRole } from "@/lib/types/common.types";

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
}

interface AuthActions {
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  hasPermission: (requiredRoles: UserRole[]) => boolean;
  isAdmin: () => boolean;
  isModerator: () => boolean;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      token: null,
      user: null,
      isAuthenticated: false,

      // Actions
      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),

      logout: () => set({ token: null, user: null, isAuthenticated: false }),

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
    }),
    {
      name: "formatosoft-auth",
    }
  )
);
