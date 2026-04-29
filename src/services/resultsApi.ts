// src/services/resultsApi.ts
import { apiClient } from "@/lib/api/client";

export interface CreateTimeResultDto {
  registrationId: number;
  timeValue: string;
  rankPosition?: number;
  notes?: string;
  phaseId?: number;
}

export interface SwimmingResult {
  resultId: number;
  participationId: number;
  timeValue: string;
  rankPosition?: number | null;
  notes?: string | null;
  participation: {
    participationId: number;
    registration: {
      registrationId: number;
      athlete?: {
        athleteId: number;
        name: string;
        institution: {
          code: string;
          name: string;
        };
      };
      team?: {
        teamId: number;
        name: string;
        institution: {
          code: string;
          name: string;
        };
        members: Array<{
          tmId: number;
          athlete: {
            athleteId: number;
            name: string;
          };
        }>;
      };
    };
  };
}

export interface PoomsaeResult {
  resultId: number;
  participationId: number;
  finalScore: number | null;
  rankPosition?: number | null;
  notes?: string | null;
  participation: {
    participationId: number;
    registration: {
      registrationId: number;
      athlete?: {
        athleteId: number;
        name: string;
        institution: {
          code: string;
          name: string;
          abrev: string;
        };
      };
      team?: {
        teamId: number;
        name: string;
        institution: {
          code: string;
          name: string;
          abrev: string;
        };
      };
    };
  };
}

export const resultsApi = {
  // ── Tiempo normal ─────────────────────────────────────────────────────────
  createTimeResult: async (data: CreateTimeResultDto): Promise<SwimmingResult> => {
    const response = await apiClient.post("/results/time", data);
    return response.data;
  },

  updateTimeResult: async (
    resultId: number,
    data: Partial<CreateTimeResultDto>,
  ): Promise<SwimmingResult> => {
    const response = await apiClient.patch(`/results/time/${resultId}`, data); // ← CORREGIDO
    return response.data;
  },

  deleteTimeResult: async (resultId: number): Promise<void> => {
    await apiClient.delete(`/results/${resultId}`);
  },

  // ── Estados especiales ────────────────────────────────────────────────────
  createDNSResult: (registrationId: number, phaseId: number) =>
    apiClient.post("/results/dns", { registrationId, phaseId }).then((r) => r.data),

  createDNFResult: (registrationId: number, phaseId: number) =>
    apiClient
      .post("/results/time", { registrationId, phaseId, timeValue: "DNF", notes: "DNF" })
      .then((r) => r.data),

  createDQResult: (registrationId: number, phaseId: number) =>
    apiClient
      .post("/results/time", { registrationId, phaseId, timeValue: "DQ", notes: "DQ" })
      .then((r) => r.data),

  // ── Consultas ─────────────────────────────────────────────────────────────
  getPhaseResults: async (phaseId: number) => {
    const response = await apiClient.get(`/results/phase/${phaseId}`);
    return response.data;
  },

  getSwimmingResults: async (eventCategoryId: number): Promise<SwimmingResult[]> => {
    const response = await apiClient.get(`/results/swimming/${eventCategoryId}`);
    return response.data;
  },

  getPoomsaeResults: async (eventCategoryId: number): Promise<PoomsaeResult[]> => {
    const response = await apiClient.get(`/results/poomsae/${eventCategoryId}`);
    return response.data;
  },

  recalculatePositions: async (eventCategoryId: number): Promise<void> => {
    await apiClient.post(`/results/swimming/${eventCategoryId}/recalculate`);
  },
};