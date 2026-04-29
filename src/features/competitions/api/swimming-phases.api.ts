// src/features/competitions/api/swimming-phases.api.ts
import { apiClient } from "@/lib/api/client";

export interface GenerateSwimmingSeriesGroupDto {
  name: string;
  registrationIds: number[];
}

export interface GenerateSwimmingSeriesDto {
  groups: GenerateSwimmingSeriesGroupDto[];
}

export interface GenerateSwimmingSeriesResponse {
  created: number;
  phaseIds: number[];
}

export const generateSwimmingSeries = async (
  eventCategoryId: number,
  data: GenerateSwimmingSeriesDto,
): Promise<GenerateSwimmingSeriesResponse> => {
  const response = await apiClient.post<GenerateSwimmingSeriesResponse>(
    `/competitions/phases/${eventCategoryId}/generate-swimming-series`,
    data,
  );
  return response.data;
};