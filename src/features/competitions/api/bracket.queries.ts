import { useQuery } from "@tanstack/react-query";
import { bracketApi } from "./bracket.api";

export function useBracketStructure(phaseId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ["bracket", phaseId, "structure"],
    queryFn: () => bracketApi.getStructure(phaseId),
    enabled: enabled && phaseId > 0,
  });
}

export function useBracketComplete(phaseId: number) {
  return useQuery({
    queryKey: ["bracket", phaseId, "complete"],
    queryFn: () => bracketApi.isComplete(phaseId),
    enabled: phaseId > 0,
  });
}

export function useBracketChampion(phaseId: number, enabled: boolean = false) {
  return useQuery({
    queryKey: ["bracket", phaseId, "champion"],
    queryFn: () => bracketApi.getChampion(phaseId),
    enabled: enabled && phaseId > 0,
  });
}

export function useBracketThirdPlace(
  phaseId: number,
  enabled: boolean = false,
) {
  return useQuery({
    queryKey: ["bracket", phaseId, "third-place"],
    queryFn: () => bracketApi.getThirdPlace(phaseId),
    enabled: enabled && phaseId > 0,
  });
}
