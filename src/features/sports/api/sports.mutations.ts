import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { sportKeys } from "./sports.queries";
import type { CreateSportData, UpdateSportData, Sport } from "../types";

export const useCreateSport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSportData) => {
      const response = await apiClient.post<Sport>(
        ENDPOINTS.SPORTS.CREATE,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sportKeys.lists() });
    },
  });
};

export const useUpdateSport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateSportData }) => {
      const response = await apiClient.patch<Sport>(
        ENDPOINTS.SPORTS.UPDATE(id),
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: sportKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: sportKeys.detail(variables.id),
      });
    },
  });
};

export const useDeleteSport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(ENDPOINTS.SPORTS.DELETE(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sportKeys.lists() });
    },
  });
};
