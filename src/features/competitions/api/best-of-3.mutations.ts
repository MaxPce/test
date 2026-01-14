import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bestOf3Api } from "./best-of-3.api";

export function useInitializeBestOf3() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bestOf3Api.initialize,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["matches", variables.phaseId],
      });
    },
  });
}
