import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { Team } from "../types";

export const teamKeys = {
  all: ["teams"] as const,
  lists: () => [...teamKeys.all, "list"] as const,
  list: (filters?: { institutionId?: number; categoryId?: number }) =>
    [...teamKeys.lists(), filters] as const,
  details: () => [...teamKeys.all, "detail"] as const,
  detail: (id: number) => [...teamKeys.details(), id] as const,
};

interface TeamsParams {
  institutionId?: number;
  categoryId?: number;
}

export const useTeams = (params?: TeamsParams) => {
  return useQuery({
    queryKey: teamKeys.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<Team[]>(ENDPOINTS.TEAMS.LIST, {
        params,
      });
      return data;
    },
  });
};

export const useTeam = (id: number) => {
  return useQuery({
    queryKey: teamKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<Team>(ENDPOINTS.TEAMS.DETAIL(id));
      return data;
    },
    enabled: !!id,
  });
};
