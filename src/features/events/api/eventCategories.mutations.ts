import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { eventCategoryKeys } from "./eventCategories.queries";
import { eventKeys } from "./events.queries";
import type {
  CreateEventCategoryData,
  UpdateEventCategoryData,
  EventCategory,
} from "../types";

export const useCreateEventCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateEventCategoryData) => {
      const response = await apiClient.post<EventCategory>(
        ENDPOINTS.EVENT_CATEGORIES.CREATE,
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: eventCategoryKeys.lists() });
      
      // Invalidar eventos locales
      if (data.eventId) {
        queryClient.invalidateQueries({
          queryKey: eventKeys.detail(data.eventId),
        });
      }
      
      // Invalidar eventos de Sismaster
      if (data.externalEventId) {
        queryClient.invalidateQueries({
          queryKey: ['sismaster-event-categories', data.externalEventId],
        });
      }
    },
  });
};


export const useUpdateEventCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateEventCategoryData;
    }) => {
      const response = await apiClient.patch<EventCategory>(
        ENDPOINTS.EVENT_CATEGORIES.UPDATE(id),
        data
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: eventCategoryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: eventCategoryKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: eventKeys.detail(data.eventId),
      });
    },
  });
};

export const useDeleteEventCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(ENDPOINTS.EVENT_CATEGORIES.DELETE(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventCategoryKeys.lists() });
    },
  });
};
