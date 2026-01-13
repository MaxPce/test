import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { matchKeys } from "./matches.queries";
import { phaseKeys } from "./phases.queries";
import type { CreateMatchData, UpdateMatchData, Match } from "../types";

export const useCreateMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMatchData) => {
      const response = await apiClient.post<Match>(
        ENDPOINTS.MATCHES.CREATE,
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: phaseKeys.detail(data.phaseId),
      });
    },
  });
};

export const useUpdateMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateMatchData }) => {
      const response = await apiClient.patch<Match>(
        ENDPOINTS.MATCHES.UPDATE(id),
        data
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: matchKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: phaseKeys.detail(data.phaseId),
      });
    },
  });
};

export const useDeleteMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(ENDPOINTS.MATCHES.DELETE(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
    },
  });
};
