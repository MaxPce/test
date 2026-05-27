import { useMutation, useQueryClient } from "@tanstack/react-query";
import { groupStageApi, type CreateGroupStagePayload } from "./group-stage.api";

export function useCreateGroupStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGroupStagePayload) =>
      groupStageApi.createGroups(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["phases"] });
      queryClient.invalidateQueries({
        queryKey: ["phases", variables.parentPhaseId],
      });
    },
  });
}

export function useCloseGroups() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (parentPhaseId: number) =>
      groupStageApi.closeGroups(parentPhaseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phases"] });
    },
  });
}