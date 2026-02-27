import { apiClient } from "@/lib/api/client";

export interface WeightliftingAttemptData {
  liftType: "snatch" | "clean_and_jerk";
  attemptNumber: 1 | 2 | 3;
  weightKg: number | null;
  result: "valid" | "invalid" | "not_attempted";
}

export interface WeightliftingAttempt {
  attemptId: number;
  participationId: number;
  liftType: "snatch" | "clean_and_jerk";
  attemptNumber: 1 | 2 | 3;
  weightKg: number | null;
  result: "valid" | "invalid" | "not_attempted";
  createdAt: string;
  updatedAt: string;
}

export interface WeightliftingAthleteResult {
  participation: {
    participationId: number;
    registration?: {
      athlete?: {
        athleteId: number;
        name: string;
        institution?: { name: string };
      };
    };
  };
  snatchAttempts: WeightliftingAttempt[];
  cleanAndJerkAttempts: WeightliftingAttempt[];
  bestSnatch: number | null;
  bestCleanAndJerk: number | null;
  total: number | null;
  totalAchievedAtAttempt: number | null;
  rank: number | null;
}

export const weightliftingApi = {
  getPhaseResults: async (
    phaseId: number,
  ): Promise<WeightliftingAthleteResult[]> => {
    const { data } = await apiClient.get(
      `/competitions/weightlifting/phases/${phaseId}/results`,
    );
    return data;
  },

  getParticipationAttempts: async (
    participationId: number,
  ): Promise<WeightliftingAttempt[]> => {
    const { data } = await apiClient.get(
      `/competitions/weightlifting/participations/${participationId}/attempts`,
    );
    return data;
  },

  upsertAttempt: async (
    participationId: number,
    attemptData: WeightliftingAttemptData,
  ): Promise<WeightliftingAttempt> => {
    const { data } = await apiClient.put(
      `/competitions/weightlifting/participations/${participationId}/attempt`,
      attemptData,
    );
    return data;
  },
};
