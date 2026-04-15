// src/features/competitions/api/athletics-phases.mutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  generateAthleticsSeries,
  type GenerateAthleticsSeriesDto,
} from "./athletics-phases.api";

interface MutationArgs {
  eventCategoryId: number;
  data: GenerateAthleticsSeriesDto;
}

export function useGenerateAthleticsSeries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventCategoryId, data }: MutationArgs) =>
      generateAthleticsSeries(eventCategoryId, data),
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