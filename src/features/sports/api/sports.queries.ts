import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { Sport } from "../types";

export const sportKeys = {
  all: ["sports"] as const,
  lists: () => [...sportKeys.all, "list"] as const,
  list: (filters?: { sportTypeId?: number }) =>
    [...sportKeys.lists(), filters] as const,
  details: () => [...sportKeys.all, "detail"] as const,
  detail: (id: number) => [...sportKeys.details(), id] as const,
};

interface SportsParams {
  sportTypeId?: number;
}

export const useSports = (params?: SportsParams) => {
  return useQuery({
    queryKey: sportKeys.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<Sport[]>(ENDPOINTS.SPORTS.LIST, {
        params,
      });
      return data;
    },
  });
};

export const useSport = (id: number) => {
  return useQuery({
    queryKey: sportKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<Sport>(ENDPOINTS.SPORTS.DETAIL(id));
      return data;
    },
    enabled: !!id,
  });
};
