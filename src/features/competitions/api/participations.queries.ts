import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { Participation } from "../types";

export const participationKeys = {
  all: ["participations"] as const,
  lists: () => [...participationKeys.all, "list"] as const,
  list: (filters?: { phaseId?: number }) =>
    [...participationKeys.lists(), filters] as const,
  details: () => [...participationKeys.all, "detail"] as const,
  detail: (id: number) => [...participationKeys.details(), id] as const,
};

interface ParticipationsParams {
  phaseId?: number;
}

export const useParticipations = (params?: ParticipationsParams) => {
  return useQuery({
    queryKey: participationKeys.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<Participation[]>(
        ENDPOINTS.PARTICIPATIONS.LIST,
        { params }
      );
      return data;
    },
  });
};

export const useParticipation = (id: number) => {
  return useQuery({
    queryKey: participationKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<Participation>(
        ENDPOINTS.PARTICIPATIONS.DETAIL(id)
      );
      return data;
    },
    enabled: !!id,
  });
};
