import { useQuery } from "@tanstack/react-query";
import { groupStageApi } from "./group-stage.api";

export function useGroupStandings(groupPhaseId: number | null) {
  return useQuery({
    queryKey: ["group-standings", groupPhaseId],
    queryFn: () => groupStageApi.getStandings(groupPhaseId!),
    enabled: groupPhaseId !== null,
  });
}

export function usePhaseWithSubPhases(phaseId: number) {
  // Reutiliza el query key de "phases" que ya invalidas en mutations
  return useQuery({
    queryKey: ["phases", phaseId, "with-sub"],
    queryFn: () => groupStageApi.getPhaseWithSubPhases(phaseId),
    enabled: phaseId > 0,
  });
}