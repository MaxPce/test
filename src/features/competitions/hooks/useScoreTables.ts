// src/hooks/useScoreTables.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { ScoreSummaryResponse } from '../types/score-tables.types';

// ─── API function ─────────────────────────────────────────────────────────────

async function fetchScoreSummary(
  externalEventId: number | string,
  localSportId: number | string,       // ← renombrado
): Promise<ScoreSummaryResponse> {
  const res = await apiClient.get<ScoreSummaryResponse>(
    `/score-tables/external/${externalEventId}/local-sport/${localSportId}/summary`,
  );
  return res.data;
}


// ─── Hook ─────────────────────────────────────────────────────────────────────

export const SCORE_TABLES_KEY = (
  externalEventId: number | string,
  externalSportId: number | string,
) => ['score-tables', externalEventId, externalSportId] as const;

export function useScoreTables(
  externalEventId: number | string,
  localSportId: number | string,      
) {
  return useQuery({
    queryKey: SCORE_TABLES_KEY(externalEventId, localSportId),
    queryFn:  () => fetchScoreSummary(externalEventId, localSportId),
    enabled:  !!externalEventId && !!localSportId,
  });
}