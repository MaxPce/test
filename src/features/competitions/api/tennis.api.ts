// src/features/competitions/api/tennis.api.ts

import { apiClient } from "@/lib/api/client";

export type GenerateTennisPhasesMode = "with_matches" | "phases_only";

export interface GenerateTennisPhasesPayload {
  eventCategoryId: number;
  mode: GenerateTennisPhasesMode;
}

export interface GenerateTennisPhasesResult {
  phases: any[];
  matchesGenerated: boolean;
  message: string;
}

export const tennisApi = {
  generatePhases: async (
    payload: GenerateTennisPhasesPayload
  ): Promise<GenerateTennisPhasesResult> => {
    const response = await apiClient.post(
      `/competitions/tennis/generate-phases`,
      payload
    );
    return response.data;
  },
};