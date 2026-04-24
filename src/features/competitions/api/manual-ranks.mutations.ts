// src/features/competitions/api/manual-ranks.mutations.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { manualRanksApi, type SetManualRankPayload } from "./manual-ranks.api";
import { toast } from "sonner";

export function useSetManualRanks(phaseId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ranks: SetManualRankPayload[]) =>
      manualRanksApi.set(phaseId, ranks),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["manual-ranks", phaseId] });
      queryClient.invalidateQueries({ queryKey: ["standings", phaseId] });
      queryClient.invalidateQueries({ queryKey: ["best-of-3-status", phaseId] });
      toast.success(`${data.updated} ranking${data.updated !== 1 ? "s" : ""} guardado${data.updated !== 1 ? "s" : ""} correctamente`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al guardar el ranking manual");
    },
  });
}

export function useClearManualRanks(phaseId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => manualRanksApi.clear(phaseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manual-ranks", phaseId] });
      queryClient.invalidateQueries({ queryKey: ["standings", phaseId] });
      queryClient.invalidateQueries({ queryKey: ["best-of-3-status", phaseId] });
      toast.success("Clasificación restablecida al cálculo automático");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al limpiar el ranking manual");
    },
  });
}