import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAthleticsTime } from "./athletics.api";
import type { UpdateAthleticsTimeDto } from "../types/athletics.types";

export const useUpdateAthleticsTime = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      participationId,
      data,
    }: {
      participationId: number;
      data: UpdateAthleticsTimeDto;
    }) => updateAthleticsTime(participationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["athletics-results"] });
    },
  });
};
