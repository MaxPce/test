import { useMutation, useQueryClient } from "@tanstack/react-query";
import { standingsApi } from "./standings.api";

export function useUpdateStandings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: standingsApi.update,
    onSuccess: (_, phaseId) => {
      queryClient.invalidateQueries({ queryKey: ["standings", phaseId] });
    },
  });
}


export function useSetManualStandingRanks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      phaseId: number;
      ranks: { registrationId: number; manualRankPosition: number | null }[];
    }) => standingsApi.setManualRanks(data.phaseId, data.ranks),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["matches", variables.phaseId],
      });
    },
  });
}

export function useClearManualStandingRanks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (phaseId: number) => standingsApi.clearManualRanks(phaseId),
    onSuccess: (_, phaseId) => {
      queryClient.invalidateQueries({ queryKey: ["matches", phaseId] });
    },
  });
}
