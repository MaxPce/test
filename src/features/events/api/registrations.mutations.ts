import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { registrationKeys } from "./registrations.queries";
import { eventCategoryKeys } from "./eventCategories.queries";
import type {
  CreateRegistrationData,
  BulkRegistrationData,
  Registration,
} from "../types";

export const useCreateRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRegistrationData) => {
      const response = await apiClient.post<Registration>(
        ENDPOINTS.REGISTRATIONS.CREATE,
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: registrationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: eventCategoryKeys.detail(data.eventCategoryId),
      });
    },
  });
};

export const useBulkRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BulkRegistrationData) => {
      const response = await apiClient.post(ENDPOINTS.REGISTRATIONS.BULK, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: registrationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: eventCategoryKeys.detail(variables.eventCategoryId),
      });
    },
  });
};

export const useDeleteRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(ENDPOINTS.REGISTRATIONS.DELETE(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: registrationKeys.lists() });
    },
  });
};
