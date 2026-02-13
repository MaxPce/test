import { useQuery } from "@tanstack/react-query";
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

export const useEventCategories = (params?: EventCategoriesParams) => {
  return useQuery({
    queryKey: eventCategoryKeys.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<EventCategory[]>(
        ENDPOINTS.EVENT_CATEGORIES.LIST,
        { params }
      );
      return data;
    },
  });
};

export const useEventCategory = (id: number) => {
  return useQuery({
    queryKey: eventCategoryKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<EventCategory>(
        ENDPOINTS.EVENT_CATEGORIES.DETAIL(id)
      );
      return data;
    },
    enabled: !!id,
  });
};

export const useSismasterEventCategories = (externalEventId?: number) => {
  return useQuery({
    queryKey: ['sismaster-event-categories', externalEventId],
    queryFn: async () => {
      if (!externalEventId) return [];
      const { data } = await apiClient.get<EventCategory[]>(
        `/events/sismaster/${externalEventId}/categories`
      );
      return data;
    },
    enabled: !!externalEventId,
  });
};

