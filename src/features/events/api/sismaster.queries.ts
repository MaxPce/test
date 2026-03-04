import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

// ── Tipos existentes (sin cambios) ─────────────────────────────
export const sismasterEventKeys = {
  events: {
    all: ["sismaster", "events"] as const,
    list: () => [...sismasterEventKeys.events.all, "list"] as const,
    detail: (id: number) =>
      [...sismasterEventKeys.events.all, "detail", id] as const,
  },
};

// ── Tipos NUEVOS (shapes exactos del backend) ──────────────────

export interface SportParamDto {
  idparam: number;
  code: number;
  name: string;
  idsport: number;
  athleteCount: number;
}

export interface AthleteByCategoryDto {
  idperson: number;
  idparam: number;
  docnumber: string;
  firstname: string;
  lastname: string;
  surname: string;
  birthday: string;
  gender: string;
  gender_text: string;
  fullName: string;
  age: number | null;
  photo: string | null;
  institutionName: string;
  institutionAbrev: string;
  institutionLogo: string | null;
  division_inscrita: string;
  idacreditation: number;
  idevent: number;
  idsport: number;
  idinstitution: number;
}

// ── Hooks existentes (sin cambios) ─────────────────────────────

export const useSismasterEvents = () =>
  useQuery({
    queryKey: sismasterEventKeys.events.list(),
    queryFn: async () => {
      const { data } = await apiClient.get(ENDPOINTS.SISMASTER.EVENTS.LIST);
      return data;
    },
    staleTime: 1000 * 60 * 30,
  });

export const useSismasterEvent = (id: number) =>
  useQuery({
    queryKey: sismasterEventKeys.events.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get(ENDPOINTS.SISMASTER.EVENTS.DETAIL(id));
      return data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 30,
  });

// ── Hooks NUEVOS ───────────────────────────────────────────────

/**
 * Categorías (sport_params) con atletas inscritos en un evento.
 * Endpoint: GET /sismaster/sports/local/:localSportId/params/by-event/:sismasterEventId
 *
 * localSportId     = eventCategory.externalSportId  (sport_id local)
 * sismasterEventId = eventCategory.externalEventId  (ID del evento en Sismaster)
 */
export const useSismasterSportParams = (
  localSportId: number | null | undefined,
  sismasterEventId: number | null | undefined,
  enabled = true,
) =>
  useQuery({
    queryKey: ["sismaster", "sport-params", localSportId, sismasterEventId],
    queryFn: async () => {
      const { data } = await apiClient.get<SportParamDto[]>(
        `/sismaster/sports/local/${localSportId}/params/by-event/${sismasterEventId}`,
      );
      return data;
    },
    enabled: enabled && !!localSportId && !!sismasterEventId,
    staleTime: 1000 * 60 * 5,
  });

/**
 * Atletas inscritos en una categoría específica de Sismaster.
 * Endpoint: GET /sismaster/athletes/by-category-local
 *           ?sismasterEventId=X&localSportId=X&idparam=X
 */
export const useAthletesByCategory = (
  params: {
    sismasterEventId: number;
    localSportId: number;
    idparam: number;
  } | null,
  enabled = true,
) =>
  useQuery({
    queryKey: ["sismaster", "athletes-by-category", params],
    queryFn: async () => {
      const { data } = await apiClient.get<AthleteByCategoryDto[]>(
        "/sismaster/athletes/by-category-local",
        { params: params! },
      );
      return data;
    },
    enabled:
      enabled &&
      !!params?.sismasterEventId &&
      !!params?.localSportId &&
      !!params?.idparam,
    staleTime: 1000 * 60 * 2,
  });
