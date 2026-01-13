import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { Phase } from "../types";

export const phaseKeys = {
  all: ["phases"] as const,
  lists: () => [...phaseKeys.all, "list"] as const,
  list: (filters?: { eventCategoryId?: number }) =>
    [...phaseKeys.lists(), filters] as const,
  details: () => [...phaseKeys.all, "detail"] as const,
  detail: (id: number) => [...phaseKeys.details(), id] as const,
};

interface PhasesParams {
  eventCategoryId?: number;
}

export const usePhases = (params?: PhasesParams) => {
  return useQuery({
    queryKey: phaseKeys.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<Phase[]>(ENDPOINTS.PHASES.LIST, {
        params,
      });
      return data;
    },
  });
};

export const usePhase = (id: number) => {
  return useQuery({
    queryKey: phaseKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<Phase>(ENDPOINTS.PHASES.DETAIL(id));
      return data;
    },
    enabled: !!id,
  });
};
