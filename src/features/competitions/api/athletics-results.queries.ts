// src/features/competitions/api/athletics-results.queries.ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

// ─── Tipos existentes (sin cambios) ──────────────────────────────────────────

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

export interface ParticipatingInstitution {
  institutionId: number;
  institutionName: string;
  institutionAbrev: string | null;
  logoUrl: string | null;
}

// ─── Hooks existentes (sin cambios) ──────────────────────────────────────────

export const useAthleticsResultsByEvent = (
  externalEventId: number,
  localSportId: number,
) =>
  useQuery({
    queryKey: ["athletics-results-by-event", externalEventId, localSportId],
    queryFn: () =>
      apiClient
        .get<AthleticsCategoryData[]>(
          `/competitions/events/external/${externalEventId}/local-sport/${localSportId}/results-by-event`,
        )
        .then((r) => r.data),
    enabled: !!externalEventId && !!localSportId,
  });

export function useAthleticsParticipatingInstitutions(
  externalEventId?: number,
  localSportId?: number,
) {
  return useQuery({
    queryKey: [
      "athletics-participating-institutions",
      externalEventId,
      localSportId,
    ],
    queryFn: async () => {
      const { data } = await apiClient.get<ParticipatingInstitution[]>(
        `/competitions/events/external/${externalEventId}/local-sport/${localSportId}/participating-institutions`,
      );
      return data;
    },
    enabled: !!externalEventId && !!localSportId,
  });
}

// ─── NUEVO: Tipos para Heptatlón / Decatlón ───────────────────────────────────

/**
 * Mismo string que ya usa GenerateCombinedModal y el backend:
 * "heptatlon" | "decatlon"  (sin tilde, igual que en combined-events.config.ts)
 */
export type CombinedType = "heptatlon" | "decatlon";

export interface CombinedSubEventResult {
  /** Nombre de la sub-prueba: "100m vallas", "Salto largo", etc. */
  subEventName: string;
  /** Tipo de tabla que usa esa sub-prueba */
  tableType: "pista" | "distancia" | "altura";
  /** Marca registrada como string: "13.45", "1.72", "4.80", etc. Null si no hay resultado */
  mark: string | null;
  /** Puntos IAAF calculados para esa marca. 0 si no hay resultado */
  iaafPoints: number;
  /** Orden de la sub-prueba dentro de la combinada (1-based) */
  order: number;
}

export interface CombinedAthleteRow {
  rank: number;
  athleteId: number;
  athleteName: string;
  gender: "M" | "F";
  category: string;
  institutionId: number;
  institutionName: string;
  institutionAbrev: string | null;
  institutionLogo: string | null;
  /** Suma de puntos IAAF de todas las sub-pruebas completadas */
  totalIaafPoints: number;
  /** Cuántas sub-pruebas tienen resultado registrado */
  completedEvents: number;
  /** Total de sub-pruebas de la combinada (7 u 10) */
  totalEvents: number;
  /** true cuando completedEvents === totalEvents */
  isFinished: boolean;
  /** Detalle de cada sub-prueba */
  subResults: CombinedSubEventResult[];
}

export interface CombinedRankingResponse {
  combinedType: CombinedType;
  athletes: CombinedAthleteRow[];
}

// ─── NUEVO: Hook para ranking de combinadas ───────────────────────────────────

export function useAthleticsCombinedRanking(
  externalEventId: number,
  localSportId: number,
  combinedType: CombinedType,
) {
  return useQuery({
    queryKey: [
      "athletics-combined-ranking",
      externalEventId,
      localSportId,
      combinedType,
    ],
    queryFn: () =>
      apiClient
        .get<CombinedRankingResponse>(
          `/competitions/events/external/${externalEventId}/local-sport/${localSportId}/combined-ranking/${combinedType}`,
        )
        .then((r) => r.data),
    enabled: !!externalEventId && !!localSportId,
    staleTime: 30_000,
  });
}