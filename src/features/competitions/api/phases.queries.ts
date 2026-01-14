import { useQuery } from "@tanstack/react-query";
import { phasesApi } from "./phases.api";

export function usePhases(eventCategoryId?: number) {
  return useQuery({
    queryKey: ["phases", eventCategoryId],
    queryFn: () => phasesApi.getAll(eventCategoryId),
    enabled: !!eventCategoryId,
  });
}

export function usePhase(id: number) {
  return useQuery({
    queryKey: ["phases", id],
    queryFn: () => phasesApi.getOne(id),
    enabled: !!id,
  });
}
