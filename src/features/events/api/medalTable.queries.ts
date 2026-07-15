// src/features/events/api/medalTable.queries.ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export interface MedalRow {
  rank: number;
  institutionId: number;
  institutionName: string;
  institutionLogoUrl: string | null;
  gold: number;
  silver: number;
  bronze: number;
}

export interface MedalSummaryResponse {
  general: MedalRow[];
}

// Mapa de localSportId → prefijo de endpoint en el backend
const SPORT_ENDPOINT_MAP: Record<number, string> = {
  // Ajusta estos IDs a los reales de tu BD
  1:  "judo-medal-table",
  2:  "swimming-medal-table",
  3:  "taekwondo-kyorugui-medal-table",
  4:  "karate-medal-table",
  5:  "weightlifting-medal-table",
  6:  "wushu-medal-table",
  7:  "tennis-medal-table",   // Tenis de campo
  8:  "tennis-medal-table",   // Tenis de mesa (mismo endpoint, distinto sportId)
};

async function fetchMedalSummary(
  externalEventId: number,
  localSportId: number,
): Promise<MedalSummaryResponse> {
  const prefix = SPORT_ENDPOINT_MAP[localSportId];
  if (!prefix) throw new Error(`No hay medallero configurado para deporte ID ${localSportId}`);

  const { data } = await apiClient.get<MedalSummaryResponse>(
    `/${prefix}/external/${externalEventId}/local-sport/${localSportId}/summary`,
  );
  return data;
}

export function useMedalSummary(
  externalEventId: number | undefined,
  localSportId: number | undefined,
) {
  return useQuery({
    queryKey: ["medalSummary", externalEventId, localSportId],
    queryFn: () => fetchMedalSummary(externalEventId!, localSportId!),
    enabled: !!externalEventId && !!localSportId,
    staleTime: 30_000, 
  });
}