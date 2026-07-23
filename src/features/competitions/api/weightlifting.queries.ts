import { useQuery } from "@tanstack/react-query";
import { weightliftingApi } from "./weightlifting.api";

export const weightliftingKeys = {
  phaseResults: (phaseId: number) =>
    ["weightlifting", "phase", phaseId, "results"] as const,
  participationAttempts: (participationId: number) =>
    ["weightlifting", "participation", participationId, "attempts"] as const,
};

export function useWeightliftingPhaseResults(phaseId: number) {
  return useQuery({
    queryKey: weightliftingKeys.phaseResults(phaseId),
    queryFn: () => weightliftingApi.getPhaseResults(phaseId),
    enabled: !!phaseId,
  });
}

export function useWeightliftingAttempts(participationId: number) {
  return useQuery({
    queryKey: weightliftingKeys.participationAttempts(participationId),
    queryFn: () => weightliftingApi.getParticipationAttempts(participationId),
    enabled: !!participationId,
  });
}

export function useWeightliftingManualRanks(phaseId: number) {
  return useQuery({
    queryKey: ['weightlifting-manual-ranks', phaseId],  // ← misma key que usa useFinalizeWeightliftingPhase en onSuccess
    queryFn: () => weightliftingApi.getManualRanks(phaseId),
    enabled: !!phaseId,
  });
}
