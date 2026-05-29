// src/features/competitions/api/tennis-phases.api.ts
import { apiClient } from '@/lib/api/client';

export type TennisPhaseFormat = 'single_elimination' | 'round_robin' | 'best_of_3';

export interface GenerateTennisPhasesPayload {
  groups: {
    name: string;
    format: TennisPhaseFormat;
    registrationIds: number[];
  }[];
}

export const tennisPhasesApi = {
  generate: async (eventCategoryId: number, payload: GenerateTennisPhasesPayload) => {
    const { data } = await apiClient.post(
      `/competitions/event-categories/${eventCategoryId}/tennis/generate-phases`,
      payload,
    );
    return data;
  },
};