import { useQuery } from "@tanstack/react-query";
import { matchesApi } from "./matches.api";

export function useMatches(phaseId?: number, status?: string) {
  return useQuery({
    queryKey: ["matches", phaseId, status],
    queryFn: () => matchesApi.getAll(phaseId, status),
  });
}

export function useMatch(id: number) {
  return useQuery({
    queryKey: ["matches", id],
    queryFn: () => matchesApi.getOne(id),
    enabled: !!id,
  });
}
