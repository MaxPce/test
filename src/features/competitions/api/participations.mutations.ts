import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { participationKeys } from "./participations.queries";
import { phaseKeys } from "./phases.queries";
import type {
  CreateParticipationData,
  BulkParticipationsData,
  Participation,
} from "../types";

export const useCreateParticipation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateParticipationData) => {
      const response = await apiClient.post<Participation>(
        ENDPOINTS.PARTICIPATIONS.CREATE,
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: participationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: phaseKeys.detail(data.phaseId),
      });
    },
  });
};

export const useBulkParticipations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BulkParticipationsData) => {
      const response = await apiClient.post(
        ENDPOINTS.PARTICIPATIONS.BULK,
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: participationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: phaseKeys.detail(variables.phaseId),
      });
    },
  });
};

export const useDeleteParticipation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(ENDPOINTS.PARTICIPATIONS.DELETE(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: participationKeys.lists() });
    },
  });
};
