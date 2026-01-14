import { useQuery } from "@tanstack/react-query";
import { standingsApi } from "./standings.api";

export function useStandings(phaseId?: number) {
  return useQuery({
    queryKey: ["standings", phaseId],
    queryFn: () => standingsApi.getByPhase(phaseId!),
    enabled: !!phaseId,
  });
}
