// src/features/competitions/api/swimming-phases.mutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  generateSwimmingSeries,
  type GenerateSwimmingSeriesDto,
} from "./swimming-phases.api";

interface MutationArgs {
  eventCategoryId: number;
  data: GenerateSwimmingSeriesDto;
}

export function useGenerateSwimmingSeries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventCategoryId, data }: MutationArgs) =>
      generateSwimmingSeries(eventCategoryId, data),
    onSuccess: async (_response, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["phases", variables.eventCategoryId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["phases"],
      });
      toast.success("Series generadas correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al generar series");
    },
  });
}