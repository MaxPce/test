// src/features/competitions/api/athletics-results.queries.ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export interface AthleticsResultEntry {
  position: number;
  athleteName: string;
  university: string;
  universityAbrev: string;
  mark: string;
  windSpeed: string | null;
  points: number;
}

export interface AthleticsEventGroup {
  eventName: string;
  femaleResults: AthleticsResultEntry[];
  maleResults: AthleticsResultEntry[];
}

export interface AthleticsCategoryData {
  category: string;
  events: AthleticsEventGroup[];
}

export const useAthleticsResultsByEvent = (
  externalEventId: number,
  localSportId: number
) =>
  useQuery({
    queryKey: ["athletics-results-by-event", externalEventId, localSportId],
    queryFn: () =>
      apiClient
        .get<AthleticsCategoryData[]>(
          `/competitions/events/external/${externalEventId}/local-sport/${localSportId}/results-by-event`
        )
        .then((r) => r.data),
    enabled: !!externalEventId && !!localSportId,
  });