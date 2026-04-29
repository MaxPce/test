// src/features/results/api/swimmingMedalTable.queries.ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export interface SwimmingMedalRow {
  rank: number;
  institutionId: number;
  institutionName: string;
  institutionLogoUrl: string | null;
  gold: number;
  silver: number;
  bronze: number;
  totalPoints: number;
}

export interface SwimmingMedalSummaryResponse {
  general: SwimmingMedalRow[];
}

export function useSwimmingMedalTable(
  externalEventId: number,
  localSportId: number,
) {
  return useQuery<SwimmingMedalSummaryResponse>({
    queryKey: ["swimming-medal-table", externalEventId, localSportId],
    queryFn: async () => {
      const response = await apiClient.get(
        `/swimming-medal-table/external/${externalEventId}/local-sport/${localSportId}/summary`,
      );
      return response.data;
    },
    enabled: !!externalEventId && !!localSportId,
    staleTime: 30_000,
  });
}