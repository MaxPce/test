import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { Company } from "../types";

export const companyKeys = {
  all: ["companies"] as const,
  lists: () => [...companyKeys.all, "list"] as const,
  list: () => [...companyKeys.lists()] as const,
  details: () => [...companyKeys.all, "detail"] as const,
  detail: (id: number) => [...companyKeys.details(), id] as const,
};

export const useCompanies = () => {
  return useQuery({
    queryKey: companyKeys.list(),
    queryFn: async () => {
      const { data } = await apiClient.get<Company[]>(ENDPOINTS.COMPANIES.LIST);
      return data;
    },
  });
};

export const useCompany = (id: number) => {
  return useQuery({
    queryKey: companyKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<Company>(
        ENDPOINTS.COMPANIES.DETAIL(id),
      );
      return data;
    },
    enabled: !!id,
  });
};
