// src/features/competitions/api/weightlifting-phases.api.ts  

import { apiClient } from '@/lib/api/client';

export interface WeightliftingGroupDto {
  name: string;
  registrationIds: number[];
  // entries con weightClass por atleta
  entries: { registrationId: number; weightClass: string | null }[];
}

export interface GenerateWeightliftingPhasesDto {
  eventCategoryId: number;
  groups: WeightliftingGroupDto[];
}

export const generateWeightliftingPhases = async (
  data: GenerateWeightliftingPhasesDto,
) => {
  const response = await apiClient.post(
    '/competitions/weightlifting/generate-phases', 
    data,
  );
  return response.data;
};