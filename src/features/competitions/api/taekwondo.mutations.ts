// src/features/competitions/api/taekwondo.mutations.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateKyoruguiScore, updatePoomsaeScore } from "./taekwondo.api";
import type { KyoruguiScore, PoomsaeScore } from "../types/taekwondo.types";
import { toast } from "sonner";

export const useUpdateKyoruguiScore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, data }: { matchId: number; data: KyoruguiScore }) =>
      updateKyoruguiScore(matchId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({
        queryKey: ["kyorugui-match", variables.matchId],
      });
      queryClient.invalidateQueries({
        queryKey: ["kyorugui-bracket"],
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

export const useUpdatePoomsaeScore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      participationId,
      data,
    }: {
      participationId: number;
      data: PoomsaeScore;
    }) => updatePoomsaeScore(participationId, data),
    onSuccess: () => {
      // ✅ Invalidar TODAS las queries de poomsae-scores
      queryClient.invalidateQueries({
        queryKey: ["poomsae-scores"], // Sin phaseId para invalidar todas
      });
      toast.success("Puntaje guardado correctamente");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al guardar puntaje");
    },
  });
};
