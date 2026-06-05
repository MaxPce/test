import { useMutation, useQueryClient } from "@tanstack/react-query";
import { matchesApi } from "./matches.api";

export function useCreateMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: matchesApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["matches", data.phaseId] });
    },
  });
}

export function useUpdateMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      matchesApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["matches", data.phaseId] });
      queryClient.invalidateQueries({ queryKey: ["matches", data.matchId] });
      queryClient.invalidateQueries({ queryKey: ["standings"] });
    },
  });
}

export function useDeleteMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => matchesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["phases"] });
    },
  });
}

export function useSwapParticipants() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (matchId: number) => matchesApi.swapParticipants(matchId),
    onSuccess: () => {
      // Invalida todos los matches para que se recarguen con los corners invertidos
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}