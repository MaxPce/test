import { apiClient } from "@/lib/api/client";

export interface ClimbingScoreRow {
  rowNumber: number;
  participationId: number;
  registrationId: number;
  participantName: string;
  participantPhoto: string | null;
  institution: string | null;
  institutionAbrev: string | null;
  isTeam: boolean;
  total: number | null;
  rank: number | null;
}

export const climbingApi = {
  getScoreTable: async (phaseId: number): Promise<ClimbingScoreRow[]> => {
    const res = await apiClient.get(
      `/competitions/phases/${phaseId}/climbing-table`,
    );
    return res.data;
  },

  updateScore: async (
    participationId: number,
    data: { total?: number | null; rank?: number | null },
  ) => {
    const res = await apiClient.patch(
      `/competitions/participations/${participationId}/climbing-score`,
      data,
    );
    return res.data;
  },
};
