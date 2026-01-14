import { useMutation, useQueryClient } from "@tanstack/react-query";
import { participationsApi } from "./participations.api";

export function useCreateParticipation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: participationsApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["matches", data.matchId] });
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
