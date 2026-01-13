import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { Registration } from "../types";

export const registrationKeys = {
  all: ["registrations"] as const,
  lists: () => [...registrationKeys.all, "list"] as const,
  list: (filters?: { eventCategoryId?: number }) =>
    [...registrationKeys.lists(), filters] as const,
  details: () => [...registrationKeys.all, "detail"] as const,
  detail: (id: number) => [...registrationKeys.details(), id] as const,
};

interface RegistrationsParams {
  eventCategoryId?: number;
}

export const useRegistrations = (params?: RegistrationsParams) => {
  return useQuery({
    queryKey: registrationKeys.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<Registration[]>(
        ENDPOINTS.REGISTRATIONS.LIST,
        { params }
      );
      return data;
    },
  });
};

export const useRegistration = (id: number) => {
  return useQuery({
    queryKey: registrationKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<Registration>(
        ENDPOINTS.REGISTRATIONS.DETAIL(id)
      );
      return data;
    },
    enabled: !!id,
  });
};
