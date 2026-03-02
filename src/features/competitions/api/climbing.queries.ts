import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { climbingApi } from "./climbing.api";

export const climbingKeys = {
  scoreTable: (phaseId: number) => ["climbing", "table", phaseId] as const,
  institutional: (phaseId: number) =>
    ["climbing", "institutional", phaseId] as const,
};

export function useClimbingScoreTable(phaseId: number) {
  return useQuery({
    queryKey: climbingKeys.scoreTable(phaseId),
    queryFn: () => climbingApi.getScoreTable(phaseId),
    enabled: phaseId > 0,
  });
}

export function useClimbingInstitutionalRanking(phaseId: number) {
  return useQuery({
    queryKey: climbingKeys.institutional(phaseId),
    queryFn: () => climbingApi.getInstitutionalRanking(phaseId),
    enabled: phaseId > 0,
  });
}

export function useUpdateClimbingScore(phaseId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      participationId,
      data,
    }: {
      participationId: number;
      data: {
        result?: number | null;
        rank?: number | null;
        notes?: string | null;
      };
    }) => climbingApi.updateScore(participationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: climbingKeys.scoreTable(phaseId),
      });
      queryClient.invalidateQueries({
        queryKey: climbingKeys.institutional(phaseId),
      });
    },
  });
}
