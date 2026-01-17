import { useQuery } from "@tanstack/react-query";
import { matchesApi } from "./matches.api";

export function useMatches(phaseId?: number, status?: string) {
  return useQuery({
    queryKey: ["matches", phaseId, status],
    queryFn: () => matchesApi.getAll(phaseId, status),
  });
}

export const useMatch = (matchId: number) => {
  return useQuery({
    queryKey: ["match", matchId],
    queryFn: async () => {
      // ✅ Ajusta según tu API (puede ser ?populate, ?expand, etc.)
      const response = await fetch(
        `/api/matches/${matchId}?populate=participations.registration.athlete,phase`,
      );
      if (!response.ok) throw new Error("Failed to fetch match");
      return response.json();
    },
    enabled: matchId > 0,
  });
};
