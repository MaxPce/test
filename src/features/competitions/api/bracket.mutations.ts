import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bracketApi } from "./bracket.api";

export function useGenerateBracket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bracketApi.generateCompleteBracket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["phases"] });
    },
  });
}

export function useAdvanceWinner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bracketApi.advanceWinner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["bracket"] });
    },
  });
}

// ← nuevo: walkover genérico para todos los deportes
export interface SetWalkoverGenericPayload {
  matchId: number;
  winnerRegistrationId: number;
  reason: string;
}

export function useSetWalkoverGeneric() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SetWalkoverGenericPayload) =>
      bracketApi.setWalkover(payload),
    onSuccess: (_, { matchId }) => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
      queryClient.invalidateQueries({ queryKey: ["match-details", matchId] });
      queryClient.invalidateQueries({ queryKey: ["bracket"] });
    },
  });
}
