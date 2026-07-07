// src/features/results/api/swimmingResults.queries.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export interface SwimmingResultEntry {
  rank: number;
  athleteName: string;
  age: number | null;
  institutionName: string;
  institutionAbbrev: string | null;
  finalTime: string | null;
  points: number;
  notes: string | null;
  isTied: boolean;
  isExcluded: boolean;
}

export interface SwimmingEventResult {
  eventCategoryId: number;
  eventNumber: number;
  eventName: string;
  categoryName: string;
  gender: string;
  isRelay: boolean;
  minMark: string | null;
  entries: SwimmingResultEntry[];
}

export interface SwimmingFullResultsResponse {
  events: SwimmingEventResult[];
}

export function useSwimmingFullResults(
  externalEventId: number,
  localSportId: number,
) {
  return useQuery<SwimmingFullResultsResponse>({
    queryKey: ['swimming-full-results', externalEventId, localSportId],
    queryFn: async () => {
      const res = await apiClient.get(
        `/swimming-medal-table/external/${externalEventId}/local-sport/${localSportId}/results`,
      );
      return res.data;
    },
    enabled: !!externalEventId && !!localSportId,
    staleTime: 30_000,
  });
}