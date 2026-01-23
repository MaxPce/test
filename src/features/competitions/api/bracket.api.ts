import { apiClient } from "@/lib/api/client";

export const bracketApi = {
  generateCompleteBracket: async (data: {
    phaseId: number;
    registrationIds: number[];
    includeThirdPlace?: boolean;
  }) => {
    const response = await apiClient.post(
      "/competitions/brackets/generate-complete",
      data,
    );
    return response.data;
  },

  advanceWinner: async (data: {
    matchId: number;
    winnerRegistrationId: number;
    participant1Score?: number;
    participant2Score?: number;
  }) => {
    const response = await apiClient.post(
      "/competitions/matches/advance-winner",
      data,
    );
    return response.data;
  },

  getBracketStructure: async (phaseId: number) => {
    const response = await apiClient.get(
      `/competitions/brackets/${phaseId}/structure`,
    );
    return response.data;
  },

  isBracketComplete: async (phaseId: number) => {
    const response = await apiClient.get(
      `/competitions/brackets/${phaseId}/is-complete`,
    );
    return response.data;
  },

  getChampion: async (phaseId: number) => {
    const response = await apiClient.get(
      `/competitions/brackets/${phaseId}/champion`,
    );
    return response.data;
  },

  getThirdPlace: async (phaseId: number) => {
    const response = await apiClient.get(
      `/competitions/brackets/${phaseId}/third-place`,
    );
    return response.data;
  },
};
