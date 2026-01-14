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
    mutationFn: matchesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}
