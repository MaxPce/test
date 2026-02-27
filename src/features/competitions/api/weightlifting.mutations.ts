import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  weightliftingApi,
  type WeightliftingAttemptData,
  type WeightliftingPhaseEntry,
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
      queryClient.invalidateQueries({
        queryKey: weightliftingKeys.participationAttempts(
          variables.participationId,
        ),
      });
      queryClient.invalidateQueries({
        queryKey: weightliftingKeys.phaseResults(phaseId),
      });
    },
    onError: () => {
      toast.error("Error al guardar el intento");
    },
  });
}

export function useInitializeWeightliftingPhase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      phaseId,
      entries,
    }: {
      phaseId: number;
      entries: WeightliftingPhaseEntry[];
    }) => weightliftingApi.initializePhase(phaseId, entries),
    onSuccess: (data, { phaseId }) => {
      toast.success(
        data.participationsCreated > 0
          ? `${data.participationsCreated} atleta(s) asignados correctamente`
          : data.message,
      );
      queryClient.invalidateQueries({
        queryKey: weightliftingKeys.phaseResults(phaseId),
      });
    },
    onError: () => {
      toast.error("Error al inicializar la fase");
    },
  });
}
