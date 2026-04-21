// src/features/competitions/api/phases.api.ts

import { apiClient } from "@/lib/api/client";
import type { Phase, CreatePhaseData, PhaseGender, PhaseLevel } from "../types";

// ─── Payload para PATCH /competitions/phases/:id/settings ──────────────────────

export interface UpdatePhaseSettingsPayload {
  gender?:  PhaseGender | null;
  level?:   PhaseLevel  | null;
  isRelay?: boolean;
}

// ─── API ────────────────────────────────────────────────────────────────────────

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

  update: async (id: number, data: Partial<CreatePhaseData>): Promise<Phase> => {
    const response = await apiClient.patch(`/competitions/phases/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/competitions/phases/${id}`);
  },

  updateSettings: async (
    id: number,
    payload: UpdatePhaseSettingsPayload,
  ): Promise<Phase> => {
    // Solo envía los campos que vienen definidos
    const body: Record<string, unknown> = {};
    if (payload.gender  !== undefined) body.gender  = payload.gender;
    if (payload.level   !== undefined) body.level   = payload.level;
    if (payload.isRelay !== undefined) body.isRelay = payload.isRelay;

    const response = await apiClient.patch(
      `/competitions/phases/${id}/settings`,
      body,
    );
    return response.data;
  },
};