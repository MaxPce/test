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
