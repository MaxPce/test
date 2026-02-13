import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

// ============================================
// QUERY KEYS para cache management
// ============================================
export const sismasterSportKeys = {
  sports: {
    all: ["sismaster", "sports"] as const,
    list: () => [...sismasterSportKeys.sports.all, "list"] as const,
    detail: (id: number) =>
      [...sismasterSportKeys.sports.all, "detail", id] as const,
  },
};

// ============================================
// SPORTS HOOKS
// ============================================

/**
 * Listar todos los deportes desde sismaster
 */
export const useSismasterSports = () => {
  return useQuery({
    queryKey: sismasterSportKeys.sports.list(),
    queryFn: async () => {
      const { data } = await apiClient.get(ENDPOINTS.SISMASTER.SPORTS.LIST);
      return data;
    },
    staleTime: 1000 * 60 * 60, // Cache 1 hora (deportes cambian poco)
  });
};

/**
 * Obtener deporte por ID desde sismaster
 * @param id - ID del deporte
 */
export const useSismasterSport = (id: number) => {
  return useQuery({
    queryKey: sismasterSportKeys.sports.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get(
        ENDPOINTS.SISMASTER.SPORTS.DETAIL(id),
      );
      return data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 60,
  });
};
