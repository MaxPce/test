import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { Event } from "../types";
import type { EventStatus } from "@/lib/types/common.types";

export const eventKeys = {
  all: ["events"] as const,
  lists: () => [...eventKeys.all, "list"] as const,
  list: (filters?: { status?: EventStatus }) =>
    [...eventKeys.lists(), filters] as const,
  details: () => [...eventKeys.all, "detail"] as const,
  detail: (id: number) => [...eventKeys.details(), id] as const,
};

interface EventsParams {
  status?: EventStatus;
  companyId?: number;
}

export const useEvents = (params?: EventsParams) => {
  return useQuery({
    queryKey: eventKeys.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<Event[]>(ENDPOINTS.EVENTS.LIST, {
        params,
      });
      return data;
    },
  });
};

export const useEvent = (id: number) => {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<Event>(ENDPOINTS.EVENTS.DETAIL(id));
      return data;
    },
    enabled: !!id,
  });
};
