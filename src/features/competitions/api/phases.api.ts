import { apiClient } from "@/lib/api/client";
import type { Phase, CreatePhaseData } from "../types";

export const phasesApi = {
  getAll: async (eventCategoryId?: number): Promise<Phase[]> => {
    const params = eventCategoryId ? `?eventCategoryId=${eventCategoryId}` : "";
    const response = await apiClient.get(`/competitions/phases${params}`);
    return response.data;
  },

  getOne: async (id: number): Promise<Phase> => {
    const response = await apiClient.get(`/competitions/phases/${id}`);
    return response.data;
  },

  create: async (data: CreatePhaseData): Promise<Phase> => {
    const response = await apiClient.post("/competitions/phases", data);
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<CreatePhaseData>
  ): Promise<Phase> => {
    const response = await apiClient.patch(`/competitions/phases/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/competitions/phases/${id}`);
  },
};
