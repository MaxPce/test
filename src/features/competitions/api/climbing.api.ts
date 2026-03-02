import { apiClient } from "@/lib/api/client";

export interface ClimbingScoreRow {
  participationId: number;
  registrationId: number;
  participantName: string;
  participantPhoto: string | null;
  institution: string | null;
  institutionAbrev: string | null;
  institutionLogo: string | null;
  isTeam: boolean;
  result: number | null;
  rank: number | null;
  points: number | null;
  notes: string | null;
}

export interface InstitutionalRankRow {
  institutionName: string;
  institutionAbrev: string;
  logoUrl: string | null;
  totalPoints: number;
}

export const climbingApi = {
  getScoreTable: async (phaseId: number): Promise<ClimbingScoreRow[]> => {
    const res = await apiClient.get(
      `/competitions/phases/${phaseId}/climbing-table`,
    );
    return res.data;
  },

  getInstitutionalRanking: async (
    phaseId: number,
  ): Promise<{ general: InstitutionalRankRow[] }> => {
    const res = await apiClient.get(
      `/competitions/phases/${phaseId}/climbing-institutional`,
    );
    return res.data;
  },

  updateScore: async (
    participationId: number,
    data: {
      result?: number | null;
      rank?: number | null;
      notes?: string | null;
    },
  ) => {
    const res = await apiClient.patch(
      `/competitions/participations/${participationId}/climbing-score`,
      data,
    );
    return res.data;
  },
};
