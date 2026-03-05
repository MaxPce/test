import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { EventCategory } from "../types";

export const eventCategoryKeys = {
  all: ["eventCategories"] as const,
  lists: () => [...eventCategoryKeys.all, "list"] as const,
  list: (filters?: { eventId?: number }) =>
    [...eventCategoryKeys.lists(), filters] as const,
  details: () => [...eventCategoryKeys.all, "detail"] as const,
  detail: (id: number) => [...eventCategoryKeys.details(), id] as const,
};

interface EventCategoriesParams {
  eventId?: number;
}
interface EventCategoriesOptions {
  enabled?: boolean;
}


export const useEventCategories = (params?: EventCategoriesParams, options?: EventCategoriesOptions,) => {
  return useQuery({
    queryKey: eventCategoryKeys.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<EventCategory[]>(
        ENDPOINTS.EVENT_CATEGORIES.LIST,
        { params },
      );
      return data;
    },
    enabled: options?.enabled ?? true,
    staleTime: 0,
  });
};

export const useEventCategory = (id: number) => {
  return useQuery({
    queryKey: eventCategoryKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<EventCategory>(
        ENDPOINTS.EVENT_CATEGORIES.DETAIL(id),
      );
      return data;
    },
    enabled: !!id,
    staleTime: 0,
  });
};

export const useSismasterEventCategories = (externalEventId?: number) => {
  return useQuery({
    queryKey: ["sismaster-event-categories", externalEventId],
    queryFn: async () => {
      if (!externalEventId) return [];
      const { data } = await apiClient.get<EventCategory[]>(
        `/events/sismaster/${externalEventId}/categories`,
      );
      return data;
    },
    enabled: !!externalEventId,
    staleTime: 0,
  });
};

export const useSismasterSportsByEvent = (sismasterEventId?: number) => {
  return useQuery({
    queryKey: ["sismaster-sports", sismasterEventId],
    queryFn: async () => {
      if (!sismasterEventId) return [];
      // Usa tu endpoint existente que SÍ funciona
      const { data: sports } = await apiClient.get(`/sismaster/events/${sismasterEventId}/sports`);
      const allCategories: any[] = [];
      
      // Carga categorías por deporte en paralelo
      await Promise.all(
        sports.map(async (sport: any) => {
          const { data: categories } = await apiClient.get(
            `/sismaster/sports/local/${sport.sport_id}/params/by-event/${sismasterEventId}`
          );
          categories.forEach((cat: any) => {
            allCategories.push({
              category: {
                sport: { ...sport, sportId: sport.sport_id },
                name: cat.name,
              },
              registrations: [], // Placeholder
            });
          });
        })
      );
      
      return allCategories;
    },
    enabled: !!sismasterEventId,
    staleTime: 5 * 60 * 1000, // 5 min
  });
};

interface RegisterCategoriesResult {
  localEventId: null;
  sismasterEventId: number;
  sportsProcessed: number;
  created: number;
  skipped: number;
  alreadyExists: number;
}

export const useRegisterEventCategories = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sismasterEventId: number) =>
      apiClient
        .post(`/events/sismaster/${sismasterEventId}/register-categories`)
        .then((r) => r.data as RegisterCategoriesResult),

    onSuccess: (data) => {
      // Invalida las categorías del evento para que se refresquen automáticamente
      queryClient.invalidateQueries({
        queryKey: ["sismaster-event-categories", data.sismasterEventId],
      });
    },
  });
};
