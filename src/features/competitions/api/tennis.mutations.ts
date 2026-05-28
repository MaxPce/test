// src/features/competitions/api/tennis.mutations.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { tennisApi, type GenerateTennisPhasesPayload } from "./tennis.api";

export function useGenerateTennisPhases() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GenerateTennisPhasesPayload) =>
      tennisApi.generatePhases(payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["phases", variables.eventCategoryId],
      });
      queryClient.invalidateQueries({ queryKey: ["phases"] });
      toast.success(data.message || "Fases generadas correctamente");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Error al generar las fases"
      );
    },
  });
}