// src/features/competitions/api/manual-ranks.queries.ts

import { useQuery } from "@tanstack/react-query";
import { manualRanksApi } from "./manual-ranks.api";

export function useManualRanks(phaseId: number) {
  return useQuery({
    queryKey: ["manual-ranks", phaseId],
    queryFn: () => manualRanksApi.getByPhase(phaseId),
    enabled: !!phaseId,
  });
}

export function useBestOf3SeriesStatus(phaseId: number) {
  return useQuery({
    queryKey: ["best-of-3-status", phaseId],
    queryFn: () => manualRanksApi.getBestOf3Status(phaseId),
    enabled: !!phaseId,
  });
}