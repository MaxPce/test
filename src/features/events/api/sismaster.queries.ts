import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

// ============================================
// QUERY KEYS para cache management
// ============================================
export const sismasterEventKeys = {
  events: {
    all: ["sismaster", "events"] as const,
    list: () => [...sismasterEventKeys.events.all, "list"] as const,
    detail: (id: number) =>
      [...sismasterEventKeys.events.all, "detail", id] as const,
  },
};

// ============================================
// EVENTS HOOKS
// ============================================

/**
 * Listar todos los eventos desde sismaster
 */
export const useSismasterEvents = () => {
  return useQuery({
    queryKey: sismasterEventKeys.events.list(),
    queryFn: async () => {
      const { data } = await apiClient.get(ENDPOINTS.SISMASTER.EVENTS.LIST);
      return data;
    },
    staleTime: 1000 * 60 * 30, // Cache 30 minutos
  });
};

/**
 * Obtener evento por ID desde sismaster
 * @param id - ID del evento
 */
export const useSismasterEvent = (id: number) => {
  return useQuery({
    queryKey: sismasterEventKeys.events.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get(
        ENDPOINTS.SISMASTER.EVENTS.DETAIL(id),
      );
      return data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 30,
  });
};
