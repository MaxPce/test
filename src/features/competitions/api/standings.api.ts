import { apiClient } from "@/lib/api/client";
import type { Standing } from "../types";

export interface ManualRankEntry {
  id: number;
  phaseId: number;
  registrationId: number;
  manualRankPosition: number | null;
  updatedAt: string;
  registration: {
    athlete?: {
      name: string;
      photoUrl?: string;
      institution?: {
        name: string;
        abrev?: string;
        logoUrl?: string;
      };
    } | null;
    team?: {
      name: string;
      institution?: {
        name: string;
        abrev?: string;
        logoUrl?: string;
      };
    } | null;
  };
}

export const standingsApi = {
  getByPhase: async (phaseId: number): Promise<Standing[]> => {
    const response = await apiClient.get(
      `/competitions/phases/${phaseId}/standings`
    );
    return response.data;
  },

  update: async (phaseId: number): Promise<Standing[]> => {
    const response = await apiClient.post(
      `/competitions/phases/${phaseId}/standings/update`
    );
    return response.data;
  },

  setManualRanks: async (
    phaseId: number,
    ranks: { registrationId: number; manualRankPosition: number | null }[]
  ): Promise<{ updated: number }> => {
    const response = await apiClient.patch(
      `/competitions/phases/${phaseId}/standings/manual-ranks`,
      { ranks }
    );
    return response.data;
  },

  clearManualRanks: async (phaseId: number): Promise<{ cleared: number }> => {
    const response = await apiClient.delete(
      `/competitions/phases/${phaseId}/standings/manual-ranks`
    );
    return response.data;
  },

  getManualRanks: async (phaseId: number): Promise<ManualRankEntry[]> => {
    const response = await apiClient.get(
      `/competitions/phases/${phaseId}/manual-ranks`
    );
    return response.data;
  },
};
