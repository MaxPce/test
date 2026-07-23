import { apiClient } from "@/lib/api/client";

export interface WeightliftingAttemptData {
  liftType: "snatch" | "clean_and_jerk";
  attemptNumber: 1 | 2 | 3;
  weightKg: number | null;
  result: "valid" | "invalid" | "not_attempted" | "retired"; 
}
export interface WeightliftingManualRankPayload {
  participationId: number;
  rank: number;
}

export interface WeightliftingAttempt {
  attemptId: number;
  participationId: number;
  liftType: "snatch" | "clean_and_jerk";
  attemptNumber: 1 | 2 | 3;
  weightKg: number | null;
  result: "valid" | "invalid" | "not_attempted" | "retired";
  createdAt: string;
  updatedAt: string;
}

export interface WeightliftingAthleteResult {
  participation: {
    participationId: number;
    registrationId?: number | null;
    registration?: {
      registrationId: number;
      weightClass?: string | null;
      seedNumber?: number | null;
      athlete?: {
        athleteId: number;
        name: string;
        institution?: {
          name: string;
          logoUrl?: string | null;
        };
      };
      team?: {
        name: string;
        institution?: {
          name: string;
          logoUrl?: string | null;
        };
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
  manualSnatchRank?: number | null;       
  manualCleanAndJerkRank?: number | null; 
  manualTotalRank?: number | null;        
}

export interface WeightliftingPhaseEntry {
  registrationId: number;
  weightClass: string | null;
}

export interface UpdatePositionEntry {
  participationId: number;
  snatchPosition?: number | null;
  cnjPosition?: number | null;
  totalPosition?: number | null;
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

  initializePhase: async (
    phaseId: number,
    entries: WeightliftingPhaseEntry[],
  ): Promise<{ message: string; participationsCreated: number }> => {
    const { data } = await apiClient.post(
      `/competitions/weightlifting/phases/${phaseId}/initialize`,
      { entries },
    );
    return data;
  },
  removeAthleteFromPhase: async (
    phaseId: number,
    registrationId: number,
  ): Promise<{ message: string }> => {
    const { data } = await apiClient.delete(
      `/competitions/weightlifting/phases/${phaseId}/athletes/${registrationId}`,
    );
    return data;
  },

  getManualRanks: async (phaseId: number) => {
    const { data } = await apiClient.get(`/competitions/weightlifting/phases/${phaseId}/manual-ranks`);
    return data;
  },

  setManualRanks: async (phaseId: number, ranks: WeightliftingManualRankPayload[]) => {
    const { data } = await apiClient.patch(`/competitions/weightlifting/phases/${phaseId}/manual-ranks`, { ranks });
    return data;
  },

  clearManualRanks: async (phaseId: number) => {
    const { data } = await apiClient.delete(`/competitions/weightlifting/phases/${phaseId}/manual-ranks`);
    return data;
  },

  finalizePhase: async (phaseId: number) => {
    const { data } = await apiClient.post(`/competitions/weightlifting/phases/${phaseId}/finalize`);
    return data;
  },


};
export async function updateWeightliftingPositions(
  phaseId: number,
  positions: UpdatePositionEntry[],
): Promise<void> {
  await apiClient.patch(`/weightlifting/phase/${phaseId}/positions`, {
    positions,
  });
}