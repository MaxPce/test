import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { sportTypeKeys } from "./sportTypes.queries";
import type {
  CreateSportTypeData,
  UpdateSportTypeData,
  SportType,
} from "../types";

export const useCreateSportType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSportTypeData) => {
      const response = await apiClient.post<SportType>(
        ENDPOINTS.SPORTS.TYPES,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sportTypeKeys.lists() });
    },
  });
};

export const useUpdateSportType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateSportTypeData;
    }) => {
      const response = await apiClient.patch<SportType>(
        ENDPOINTS.SPORTS.TYPE_DETAIL(id),
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: sportTypeKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: sportTypeKeys.detail(variables.id),
      });
    },
  });
};

export const useDeleteSportType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(ENDPOINTS.SPORTS.TYPE_DETAIL(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sportTypeKeys.lists() });
    },
  });
};
