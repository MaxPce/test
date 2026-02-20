import { useQuery } from "@tanstack/react-query";
import { standingsApi } from "./standings.api";
import type { ManualRankEntry } from "./standings.api";

export function useStandings(phaseId?: number) {
  return useQuery({
    queryKey: ["standings", phaseId],
    queryFn: () => standingsApi.getByPhase(phaseId!),
    enabled: !!phaseId,
  });
}

export function useManualRanks(phaseId?: number) {
  return useQuery<ManualRankEntry[]>({
    queryKey: ["manual-ranks", phaseId],
    queryFn: () => standingsApi.getManualRanks(phaseId!),
    enabled: !!phaseId,
  });
}
