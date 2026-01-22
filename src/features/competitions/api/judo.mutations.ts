import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateJudoScore } from "./judo.api";
import type { JudoScore } from "../types/judo.types";
import { toast } from "sonner";

export const useUpdateJudoScore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, data }: { matchId: number; data: JudoScore }) =>
      updateJudoScore(matchId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({
        queryKey: ["judo-match", variables.matchId],
      });
      queryClient.invalidateQueries({
        queryKey: ["judo-bracket"],
      });
      toast.success("Puntaje actualizado correctamente");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Error al actualizar puntaje",
      );
    },
  });
};
