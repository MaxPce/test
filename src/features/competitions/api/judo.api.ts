import { apiClient } from "@/lib/api/client";
import type { JudoScore, JudoMatch } from "../types/judo.types";

export const updateJudoScore = async (matchId: number, data: JudoScore) => {
  const response = await apiClient.patch(
    `/competitions/judo/matches/${matchId}/score`,
    data,
  );
  return response.data;
};

export const getJudoMatchDetails = async (matchId: number) => {
  const response = await apiClient.get<JudoMatch>(
    `/competitions/judo/matches/${matchId}`,
  );
  return response.data;
};

export const getJudoBracket = async (phaseId: number) => {
  const response = await apiClient.get<JudoMatch[]>(
    `/competitions/judo/phases/${phaseId}/bracket`,
  );
  return response.data;
};
