import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { SportType } from "../types";

export const sportTypeKeys = {
  all: ["sportTypes"] as const,
  lists: () => [...sportTypeKeys.all, "list"] as const,
  list: () => [...sportTypeKeys.lists()] as const,
  details: () => [...sportTypeKeys.all, "detail"] as const,
  detail: (id: number) => [...sportTypeKeys.details(), id] as const,
};

export const useSportTypes = () => {
  return useQuery({
    queryKey: sportTypeKeys.list(),
    queryFn: async () => {
      const { data } = await apiClient.get<SportType[]>(ENDPOINTS.SPORTS.TYPES);
      return data;
    },
  });
};

export const useSportType = (id: number) => {
  return useQuery({
    queryKey: sportTypeKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<SportType>(
        ENDPOINTS.SPORTS.TYPE_DETAIL(id)
      );
      return data;
    },
    enabled: !!id,
  });
};
