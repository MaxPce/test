import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bracketApi } from "./bracket.api";

export function useGenerateBracket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bracketApi.generateCompleteBracket,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["phases"] });
    },
  });
}

export function useAdvanceWinner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bracketApi.advanceWinner,
    onSuccess: (data) => {
      // Invalidar todas las queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["bracket"] });
    },
  });
}
