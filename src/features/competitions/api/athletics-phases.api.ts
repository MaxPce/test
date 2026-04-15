// src/features/competitions/api/athletics-phases.api.ts
import { apiClient } from "@/lib/api/client";

export interface GenerateAthleticsSeriesGroupDto {
  name: string;
  registrationIds: number[];
}

export interface GenerateAthleticsSeriesDto {
  groups: GenerateAthleticsSeriesGroupDto[];
}

export interface GenerateAthleticsSeriesResponse {
  created: number;
  phaseIds: number[];
}

export const generateAthleticsSeries = async (
  eventCategoryId: number,
  data: GenerateAthleticsSeriesDto,
): Promise<GenerateAthleticsSeriesResponse> => {
  const response = await apiClient.post<GenerateAthleticsSeriesResponse>(
    `/competitions/phases/${eventCategoryId}/generate-series`,
    data,
  );
  return response.data;
};