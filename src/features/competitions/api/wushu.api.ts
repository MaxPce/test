import { apiClient } from '@/lib/api/client';
import type { WushuSandaScore, WushuSandaMatch } from '../types/wushu.types';

export const updateWushuScore = async (matchId: number, data: WushuSandaScore) => {
  const response = await apiClient.patch(
    `/competitions/wushu/matches/${matchId}/score`,
    data,
  );
  return response.data;
};

export const getWushuMatchDetails = async (matchId: number) => {
  const response = await apiClient.get<WushuSandaMatch>(
    `/competitions/wushu/matches/${matchId}`,
  );
  return response.data;
};

export const getWushuBracket = async (phaseId: number) => {
  const response = await apiClient.get<WushuSandaMatch[]>(
    `/competitions/wushu/phases/${phaseId}/bracket`,
  );
  return response.data;
};
