// src/features/competitions/api/taekwondo-poomsae-phases.api.ts
import { apiClient } from '@/lib/api/client';

export interface PoomsaeGroupDto {
  name: string;
  type: 'grupo' | 'eliminacion';  
  registrationIds: number[];
}

export interface GeneratePoomsaePhasesDto {
  eventCategoryId: number;
  groups: PoomsaeGroupDto[];
}

export interface GeneratePoomsaePhasesResponse {
  created: number;
  phaseIds: number[];
}

export const generatePoomsaePhases = async (
  data: GeneratePoomsaePhasesDto,
): Promise<GeneratePoomsaePhasesResponse> => {
  const response = await apiClient.post<GeneratePoomsaePhasesResponse>(
    '/competitions/taekwondo/poomsae/generate-phases',
    data,
  );
  return response.data;
};