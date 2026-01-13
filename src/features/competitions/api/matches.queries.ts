import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { Match } from "../types";

export const matchKeys = {
  all: ["matches"] as const,
  lists: () => [...matchKeys.all, "list"] as const,
  list: (filters?: { phaseId?: number }) =>
    [...matchKeys.lists(), filters] as const,
  details: () => [...matchKeys.all, "detail"] as const,
  detail: (id: number) => [...matchKeys.details(), id] as const,
};

interface MatchesParams {
  phaseId?: number;
}

export const useMatches = (params?: MatchesParams) => {
  return useQuery({
    queryKey: matchKeys.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<Match[]>(ENDPOINTS.MATCHES.LIST, {
        params,
      });
      return data;
    },
  });
};

export const useMatch = (id: number) => {
  return useQuery({
    queryKey: matchKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<Match>(ENDPOINTS.MATCHES.DETAIL(id));
      return data;
    },
    enabled: !!id,
  });
};
