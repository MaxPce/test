// src/features/competitions/api/judo-phases.api.ts
import { apiClient } from '@/lib/api/client';

export type KumitePhaseFormat =
  | 'single_elimination'
  | 'round_robin'
  | 'best_of_3';

export interface KumiteGroupDto {
  name: string;
  format: KumitePhaseFormat;
  registrationIds: number[];
}

export interface GenerateKumitePhasesDto {
  eventCategoryId: number;
  groups: KumiteGroupDto[];
}

export interface GenerateKumitePhasesResponse {
  created: number;
  phaseIds: number[];
}

export const generateKumitePhases = async (
  data: GenerateKumitePhasesDto,
): Promise<GenerateKumitePhasesResponse> => {
  const response = await apiClient.post<GenerateKumitePhasesResponse>(
    '/competitions/judo/generate-phases',
    data,
  );
  return response.data;
};