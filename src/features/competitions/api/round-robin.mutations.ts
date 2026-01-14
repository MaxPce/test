import { useMutation, useQueryClient } from "@tanstack/react-query";
import { roundRobinApi } from "./round-robin.api";

export function useInitializeRoundRobin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: roundRobinApi.initialize,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["matches", variables.phaseId],
      });
      queryClient.invalidateQueries({ queryKey: ["phases"] });
    },
  });
}
