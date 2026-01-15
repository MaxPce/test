import { http } from "@/lib/http";

export interface CreateTimeResultDto {
  participationId: number;
  timeValue: string;
  rankPosition?: number;
  notes?: string;
}

export interface SwimmingResult {
  resultId: number;
  participationId: number;
  timeValue: string;
  rankPosition?: number;
  notes?: string;
  participation: {
    participationId: number;
    registration: {
      registrationId: number;
      athlete?: {
        athleteId: number;
        firstName: string;
        lastName: string;
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
            firstName: string;
            lastName: string;
          };
        }>;
      };
    };
  };
}

export const resultsApi = {
  createTimeResult: (data: CreateTimeResultDto) =>
    http.post<SwimmingResult>("/results/time", data),

  getSwimmingResults: (eventCategoryId: number) =>
    http.get<SwimmingResult[]>(`/results/swimming/${eventCategoryId}`),

  updateTimeResult: (resultId: number, data: Partial<CreateTimeResultDto>) =>
    http.patch<SwimmingResult>(`/results/${resultId}`, data),

  deleteTimeResult: (resultId: number) =>
    http.del<void>(`/results/${resultId}`),
};
