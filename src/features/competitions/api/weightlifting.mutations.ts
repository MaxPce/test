import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  weightliftingApi,
  type WeightliftingAttemptData,
} from "./weightlifting.api";
import { weightliftingKeys } from "./weightlifting.queries";

export function useUpsertWeightliftingAttempt(phaseId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      participationId,
      attemptData,
    }: {
      participationId: number;
      attemptData: WeightliftingAttemptData;
    }) => weightliftingApi.upsertAttempt(participationId, attemptData),
    onSuccess: (_, variables) => {
      // Invalidar intentos del atleta
      queryClient.invalidateQueries({
        queryKey: weightliftingKeys.participationAttempts(
          variables.participationId,
        ),
      });
      // Invalidar resultados de la fase (ranking se recalcula)
      queryClient.invalidateQueries({
        queryKey: weightliftingKeys.phaseResults(phaseId),
      });
    },
  });
}
