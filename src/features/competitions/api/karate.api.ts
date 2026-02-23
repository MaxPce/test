import { apiClient } from '@/lib/api/client';
import type { KarateScore, KarateMatch } from '../types/karate.types';

export const updateKarateScore = async (matchId: number, data: KarateScore) => {
  const response = await apiClient.patch(
    `/competitions/karate/matches/${matchId}/score`,
    data,
  );
  return response.data;
};

export const getKarateMatchDetails = async (matchId: number) => {
  const response = await apiClient.get<KarateMatch>(
    `/competitions/karate/matches/${matchId}`,
  );
  return response.data;
};

export const getKarateBracket = async (phaseId: number) => {
  const response = await apiClient.get<KarateMatch[]>(
    `/competitions/karate/phases/${phaseId}/bracket`,
  );
  return response.data;
};
