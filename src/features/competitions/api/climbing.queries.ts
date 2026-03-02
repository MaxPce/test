import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { climbingApi } from "./climbing.api";

export const climbingKeys = {
  table: (phaseId: number) => ["climbing", "table", phaseId] as const,
};

export function useClimbingScoreTable(phaseId: number) {
  return useQuery({
    queryKey: climbingKeys.table(phaseId),
    queryFn: () => climbingApi.getScoreTable(phaseId),
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
      data: { total?: number | null; rank?: number | null };
    }) => climbingApi.updateScore(participationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: climbingKeys.table(phaseId) });
    },
  });
}
