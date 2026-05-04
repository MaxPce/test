// src/features/competitions/api/wrestlingScoreboard.queries.ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export interface WrestlingScoreboardRow {
  rank: number;
  institutionId: number;
  institutionName: string;
  institutionAbrev: string;
  logoUrl: string | null;
  gold: number;
  silver: number;
  bronze: number;
  totalPoints: number;
  byCategory: Record<string, number>; // categoryName → pts
}

export interface WrestlingScoreboardData {
  columns: string[];   // nombres de categorías ordenadas
  rows: WrestlingScoreboardRow[];
}

export function useWrestlingScoreboard(
  externalEventId: number | undefined,
  localSportId: number | undefined,
) {
  return useQuery<WrestlingScoreboardData>({
    queryKey: ["wrestling-scoreboard", externalEventId, localSportId],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/competitions/wrestling/scoreboard`,
        { params: { externalEventId, localSportId } },
      );
      return data;
    },
    enabled: !!externalEventId && !!localSportId,
    staleTime: 30_000,
  });
}