import { useMutation, useQueryClient } from "@tanstack/react-query";
import { phasesApi } from "./phases.api";
import { toast } from "sonner"; // ✅ Importar toast

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

export function useProcessPhaseByesAutomatically() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (phaseId: number) => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/competitions/phases/${phaseId}/process-byes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al procesar BYEs");
      }

      return response.json();
    },
    onSuccess: (data, phaseId) => {
      queryClient.invalidateQueries({ queryKey: ["phases", phaseId] });
      queryClient.invalidateQueries({ queryKey: ["phases"] });
      toast.success(data.message || "BYEs procesados correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al procesar BYEs");
    },
  });
}
