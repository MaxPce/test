import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tableTennisApi } from "./table-tennis.api";

export function useFinalizeMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (matchId: number) => tableTennisApi.finalizeMatch(matchId),
    onSuccess: (_, matchId) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["match-result", matchId] });
      queryClient.invalidateQueries({ queryKey: ["match-games", matchId] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}

export function useReopenMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (matchId: number) => tableTennisApi.reopenMatch(matchId),
    onSuccess: (_, matchId) => {
      queryClient.invalidateQueries({ queryKey: ["match-result", matchId] });
      queryClient.invalidateQueries({ queryKey: ["match-games", matchId] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
    },
  });
}

export function useSetWalkover() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      matchId, 
      winnerRegistrationId, 
      reason 
    }: { 
      matchId: number; 
      winnerRegistrationId: number; 
      reason?: string;
    }) => tableTennisApi.setWalkover(matchId, winnerRegistrationId, reason),
    onSuccess: (response) => {
      const matchId = response.match?.matchId;
      if (matchId) {
        queryClient.invalidateQueries({ queryKey: ["match-games", matchId] });
        queryClient.invalidateQueries({ queryKey: ["match-result", matchId] });
        queryClient.invalidateQueries({ queryKey: ["matches"] });
        queryClient.invalidateQueries({ queryKey: ["phases"] });
      }
    },
  });
}
