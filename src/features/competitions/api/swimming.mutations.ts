import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSwimmingTime } from "./swimming.api";
import type { UpdateSwimmingTimeDto } from "../types/swimming.types";

export const useUpdateSwimmingTime = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      participationId,
      data,
    }: {
      participationId: number;
      data: UpdateSwimmingTimeDto;
    }) => updateSwimmingTime(participationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["swimming-results"] });
    },
  });
};
