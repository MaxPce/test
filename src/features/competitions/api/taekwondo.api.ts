import { apiClient } from "@/lib/api/client";
import type {
  KyoruguiScore,
  PoomsaeScore,
  KyoruguiMatch,
  PoomsaeParticipant,
  PoomsaeBracketScoreResponse,
  PoomsaeBracketMatchScores,
} from "../types/taekwondo.types";

// ==================== KYORUGUI ====================

export const updateKyoruguiScore = async (
  matchId: number,
  data: KyoruguiScore,
) => {
  const response = await apiClient.patch(
    `/competitions/taekwondo/kyorugui/matches/${matchId}/score`,
    data,
  );
  return response.data;
};

export const getKyoruguiMatchDetails = async (matchId: number) => {
  const response = await apiClient.get<KyoruguiMatch>(
    `/competitions/taekwondo/kyorugui/matches/${matchId}`,
  );
  return response.data;
};

export const getKyoruguiBracket = async (phaseId: number) => {
  const response = await apiClient.get<KyoruguiMatch[]>(
    `/competitions/taekwondo/kyorugui/phases/${phaseId}/bracket`,
  );
  return response.data;
};

// ==================== POOMSAE - MODO GRUPOS ====================

export const updatePoomsaeScore = async (
  participationId: number,
  data: PoomsaeScore,
) => {
  const payload = {
    accuracy: Number(data.accuracy),
    presentation: Number(data.presentation),
  };

  console.log(
    "🚀 Enviando al backend (modo grupos):",
    payload,
    "Tipos:",
    typeof payload.accuracy,
    typeof payload.presentation,
  );

  const response = await apiClient.patch(
    `/competitions/taekwondo/poomsae/participations/${participationId}/score`,
    payload,
  );
  return response.data;
};

export const getPoomsaeScoreTable = async (phaseId: number) => {
  const response = await apiClient.get<PoomsaeParticipant[]>(
    `/competitions/taekwondo/poomsae/phases/${phaseId}/scores`,
  );
  return response.data;
};

export const getPoomsaeScore = async (participationId: number) => {
  const response = await apiClient.get(
    `/competitions/taekwondo/poomsae/participations/${participationId}/score`,
  );
  return response.data;
};

// ==================== POOMSAE - MODO BRACKET (NUEVO) ====================

/**
 * Actualiza el score de un participante en modo bracket
 * Determina automáticamente el ganador cuando ambos tienen scores
 */
export const updatePoomsaeBracketScore = async (
  participationId: number,
  data: PoomsaeScore,
) => {
  const payload = {
    accuracy: Number(data.accuracy),
    presentation: Number(data.presentation),
  };

  console.log(
    "🥋 Enviando al backend (modo BRACKET):",
    payload,
    "Tipos:",
    typeof payload.accuracy,
    typeof payload.presentation,
  );

  const response = await apiClient.patch<PoomsaeBracketScoreResponse>(
    `/competitions/taekwondo/poomsae/bracket/participations/${participationId}/score`,
    payload,
  );
  return response.data;
};

/**
 * Obtiene los scores de ambos participantes en un match específico (modo bracket)
 */
export const getPoomsaeBracketMatchScores = async (matchId: number) => {
  const response = await apiClient.get<PoomsaeBracketMatchScores>(
    `/competitions/taekwondo/poomsae/bracket/matches/${matchId}/scores`,
  );
  return response.data;
};

export const updatePoomsaeMatchScores = async (
  matchId: number,
  scores: Array<{
    participationId: number;
    accuracy: number;
    presentation: number;
  }>,
) => {
  // Llamar al endpoint correcto de bracket para cada participación
  const promises = scores.map((score) =>
    apiClient.patch(
      `/competitions/taekwondo/poomsae/bracket/participations/${score.participationId}/score`,
      {
        accuracy: Number(score.accuracy),
        presentation: Number(score.presentation),
      },
    ),
  );

  const results = await Promise.all(promises);
  return results;
};


// ==================== KYORUGUI - ROUNDS ====================

/**
 * Actualizar un solo round de Kyorugui
 */
export const updateKyoruguiSingleRound = async (
  matchId: number,
  data: {
    roundNumber: number;
    participant1Points: number;
    participant2Points: number;
  },
) => {
  console.log("🥋 Actualizando round individual:", { matchId, ...data });
  
  const response = await apiClient.post(
    `/competitions/taekwondo/kyorugui/matches/${matchId}/rounds/single`,
    data,
  );
  return response.data;
};

/**
 * Actualizar múltiples rounds de Kyorugui
 */
export const updateKyoruguiRounds = async (
  matchId: number,
  rounds: Array<{
    roundNumber: number;
    participant1Points: number;
    participant2Points: number;
  }>,
) => {
  console.log("🥋 Actualizando múltiples rounds:", { matchId, rounds });
  
  const response = await apiClient.post(
    `/competitions/taekwondo/kyorugui/matches/${matchId}/rounds`,
    { rounds },
  );
  return response.data;
};

/**
 * Obtener todos los rounds de un match
 */
export const getKyoruguiRounds = async (matchId: number) => {
  const response = await apiClient.get(
    `/competitions/taekwondo/kyorugui/matches/${matchId}/rounds`,
  );
  return response.data;
};

/**
 * Eliminar un round específico
 */
export const deleteKyoruguiRound = async (
  matchId: number,
  roundNumber: number,
) => {
  const response = await apiClient.delete(
    `/competitions/taekwondo/kyorugui/matches/${matchId}/rounds/${roundNumber}`,
  );
  return response.data;
};

