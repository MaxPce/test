import { useMutation, useQueryClient } from "@tanstack/react-query";
import { phasesApi } from "./phases.api";

export function useCreatePhase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: phasesApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["phases", data.eventCategoryId],
      });
    },
  });
}

export function useUpdatePhase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      phasesApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["phases", data.eventCategoryId],
      });
      queryClient.invalidateQueries({ queryKey: ["phases", data.phaseId] });
    },
  });
}

export function useDeletePhase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: phasesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phases"] });
    },
  });
}
