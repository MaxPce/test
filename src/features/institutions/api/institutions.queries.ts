import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { Institution } from "../types";

export const institutionKeys = {
  all: ["institutions"] as const,
  lists: () => [...institutionKeys.all, "list"] as const,
  list: () => [...institutionKeys.lists()] as const,
  details: () => [...institutionKeys.all, "detail"] as const,
  detail: (id: number) => [...institutionKeys.details(), id] as const,
};

export const useInstitutions = () => {
  return useQuery({
    queryKey: institutionKeys.list(),
    queryFn: async () => {
      const { data } = await apiClient.get<Institution[]>(
        ENDPOINTS.INSTITUTIONS.LIST
      );
      return data;
    },
  });
};

export const useInstitution = (id: number) => {
  return useQuery({
    queryKey: institutionKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<Institution>(
        ENDPOINTS.INSTITUTIONS.DETAIL(id)
      );
      return data;
    },
    enabled: !!id,
  });
};
