import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { Category } from "../types";

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (filters?: { sportId?: number }) =>
    [...categoryKeys.lists(), filters] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: number) => [...categoryKeys.details(), id] as const,
};

interface CategoriesParams {
  sportId?: number;
}

export const useCategories = (params?: CategoriesParams) => {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<Category[]>(
        ENDPOINTS.CATEGORIES.LIST,
        { params }
      );
      return data;
    },
  });
};

export const useCategory = (id: number) => {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<Category>(
        ENDPOINTS.CATEGORIES.DETAIL(id)
      );
      return data;
    },
    enabled: !!id,
  });
};
