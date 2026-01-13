import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { phaseKeys } from "./phases.queries";
import type {
  CreatePhaseData,
  UpdatePhaseData,
  Phase,
  InitializeBracketData,
  InitializeRoundRobinData,
} from "../types";

export const useCreatePhase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePhaseData) => {
      const response = await apiClient.post<Phase>(
        ENDPOINTS.PHASES.CREATE,
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: phaseKeys.lists() });
    },
  });
};

export const useUpdatePhase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdatePhaseData }) => {
      const response = await apiClient.patch<Phase>(
        ENDPOINTS.PHASES.UPDATE(id),
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: phaseKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: phaseKeys.detail(variables.id),
      });
    },
  });
};

export const useDeletePhase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(ENDPOINTS.PHASES.DELETE(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: phaseKeys.lists() });
    },
  });
};

export const useInitializeBracket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InitializeBracketData) => {
      const response = await apiClient.post(
        ENDPOINTS.PHASES.INITIALIZE_BRACKET(data.phaseId)
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: phaseKeys.detail(variables.phaseId),
      });
    },
  });
};

export const useInitializeRoundRobin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InitializeRoundRobinData) => {
      const response = await apiClient.post(
        ENDPOINTS.PHASES.INITIALIZE_ROUND_ROBIN(data.phaseId)
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: phaseKeys.detail(variables.phaseId),
      });
    },
  });
};
