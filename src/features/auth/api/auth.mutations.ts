import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { useAuthStore } from "@/app/store/useAuthStore";
import type { LoginCredentials, LoginResponse, RegisterData } from "../types";

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { data } = await apiClient.post<LoginResponse>(
        ENDPOINTS.AUTH.LOGIN,
        credentials
      );
      return data;
    },
    onSuccess: (data) => {
      setAuth(data.access_token, data.user);
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (userData: RegisterData) => {
      const { data } = await apiClient.post(ENDPOINTS.AUTH.REGISTER, userData);
      return data;
    },
  });
};

export const useLogout = () => {
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      logout();
      queryClient.clear();
    },
  });
};
