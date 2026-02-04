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
      queryClient.invalidateQueries({ queryKey: registrationKeys.all });
      queryClient.invalidateQueries({ queryKey: eventCategoryKeys.all });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: registrationKeys.all });
      queryClient.invalidateQueries({ queryKey: eventCategoryKeys.all });
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
      queryClient.invalidateQueries({ queryKey: registrationKeys.all });
      queryClient.invalidateQueries({ queryKey: eventCategoryKeys.all });
    },
  });
};

export const useUpdateRegistrationSeed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      registrationId,
      seedNumber,
    }: {
      registrationId: number;
      seedNumber: number | null;
    }) => {
      const response = await apiClient.patch(
        `/competitions/registrations/${registrationId}/seed`,
        { seedNumber }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: registrationKeys.all });
      queryClient.invalidateQueries({ queryKey: eventCategoryKeys.all });
    },
  });
};
