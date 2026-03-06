import { useMutation, useQueryClient } from "@tanstack/react-query";
import { participationsApi } from "./participations.api";

export function useCreateParticipation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: participationsApi.create,
    onSuccess: () => {
      // Invalida todos los queries de matches (cualquier fase)
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}

export function useDeleteParticipation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      matchId,
      registrationId,
    }: {
      matchId: number;
      registrationId: number;
    }) => participationsApi.delete(matchId, registrationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["matches", variables.matchId],
      });
    },
  });
}
