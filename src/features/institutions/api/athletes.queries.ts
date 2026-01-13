import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { Athlete } from "../types";

export const athleteKeys = {
  all: ["athletes"] as const,
  lists: () => [...athleteKeys.all, "list"] as const,
  list: (filters?: { institutionId?: number }) =>
    [...athleteKeys.lists(), filters] as const,
  details: () => [...athleteKeys.all, "detail"] as const,
  detail: (id: number) => [...athleteKeys.details(), id] as const,
};

interface AthletesParams {
  institutionId?: number;
}

export const useAthletes = (params?: AthletesParams) => {
  return useQuery({
    queryKey: athleteKeys.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<Athlete[]>(ENDPOINTS.ATHLETES.LIST, {
        params,
      });
      return data;
    },
  });
};

export const useAthlete = (id: number) => {
  return useQuery({
    queryKey: athleteKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<Athlete>(
        ENDPOINTS.ATHLETES.DETAIL(id)
      );
      return data;
    },
    enabled: !!id,
  });
};
