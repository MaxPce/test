import { apiClient } from '@/lib/api/client';
import type {
  WushuSandaScore,
  WushuSandaMatch,
  // === TAOLU (crear estos types en ../types/wushu.types) ===
  WushuTaoluScore,
  WushuTaoluParticipant,
  WushuTaoluBracketScoreResponse,
  WushuTaoluBracketMatchScores,
} from '../types/wushu.types';

// ==================== WUSHU - SANDA (ACTUAL) ====================

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

// ==================== WUSHU - TAOLU (NUEVO, CLON POOMSAE) ====================

// ----- MODO GRUPOS -----

export const updateWushuTaoluScore = async (
  participationId: number,
  data: WushuTaoluScore,
) => {
  const payload = {
    accuracy: Number(data.accuracy),
    presentation: Number(data.presentation),
  };

  const response = await apiClient.patch(
    `/competitions/wushu/taolu/participations/${participationId}/score`,
    payload,
  );
  return response.data;
};

export const getWushuTaoluScoreTable = async (phaseId: number) => {
  const response = await apiClient.get<WushuTaoluParticipant[]>(
    `/competitions/wushu/taolu/phases/${phaseId}/scores`,
  );
  return response.data;
};

export const getWushuTaoluScore = async (participationId: number) => {
  const response = await apiClient.get(
    `/competitions/wushu/taolu/participations/${participationId}/score`,
  );
  return response.data;
};

// ----- MODO BRACKET -----

export const updateWushuTaoluBracketScore = async (
  participationId: number,
  data: WushuTaoluScore,
) => {
  const payload = {
    accuracy: Number(data.accuracy),
    presentation: Number(data.presentation),
  };

  const response = await apiClient.patch<WushuTaoluBracketScoreResponse>(
    `/competitions/wushu/taolu/bracket/participations/${participationId}/score`,
    payload,
  );
  return response.data;
};

export const getWushuTaoluBracketMatchScores = async (matchId: number) => {
  const response = await apiClient.get<WushuTaoluBracketMatchScores>(
    `/competitions/wushu/taolu/bracket/matches/${matchId}/scores`,
  );
  return response.data;
};

// Helper opcional (igual al de Poomsae): actualiza 2 participaciones “en paralelo”
export const updateWushuTaoluMatchScores = async (
  scores: Array<{
    participationId: number;
    accuracy: number;
    presentation: number;
  }>,
) => {
  const promises = scores.map((score) =>
    apiClient.patch(
      `/competitions/wushu/taolu/bracket/participations/${score.participationId}/score`,
      {
        accuracy: Number(score.accuracy),
        presentation: Number(score.presentation),
      },
    ),
  );

  return Promise.all(promises);
};
