// src/features/competitions/api/manual-ranks.api.ts

import { apiClient } from "@/lib/api/client";

export interface ManualRankItem {
  id: number;
  phaseId: number;
  registrationId: number;
  manualRankPosition: number | null;
  updatedAt: string;
  registration: {
    athlete?: {
      name: string;
      photoUrl?: string;
      institution?: { name: string; abrev: string; logoUrl?: string };
    } | null;
    team?: {
      name: string;
      institution?: { name: string; abrev: string; logoUrl?: string };
    } | null;
  };
}

export interface SetManualRankPayload {
  registrationId: number;
  manualRankPosition: number;
}

export interface BestOf3Participant {
  registrationId: number;
  wins: number;
  manualRankPosition: number | null;
  registration: {
    athlete?: {
      name: string;
      institution?: { name: string; abrev: string };
    } | null;
    team?: {
      name: string;
      institution?: { name: string; abrev: string };
    } | null;
  };
}

export interface BestOf3SeriesStatus {
  phaseId: number;
  participants: BestOf3Participant[];
  matches: any[];
  totalPlayed: number;
  serieCompleta: boolean;
  winner: BestOf3Participant | null;
  manualRanksApplied: boolean;
}

export const manualRanksApi = {
  getByPhase: async (phaseId: number): Promise<ManualRankItem[]> => {
    const response = await apiClient.get(
      `/competitions/phases/${phaseId}/manual-ranks`,
    );
    return response.data;
  },

  set: async (
    phaseId: number,
    ranks: SetManualRankPayload[],
  ): Promise<{ updated: number }> => {
    const response = await apiClient.patch(
      `/competitions/phases/${phaseId}/standings/manual-ranks`,
      { ranks },
    );
    return response.data;
  },

  clear: async (phaseId: number): Promise<{ cleared: number }> => {
    const response = await apiClient.delete(
      `/competitions/phases/${phaseId}/standings/manual-ranks`,
    );
    return response.data;
  },

  getBestOf3Status: async (phaseId: number): Promise<BestOf3SeriesStatus> => {
    const response = await apiClient.get(
      `/competitions/phases/${phaseId}/best-of-3/status`,
    );
    return response.data;
  },
};