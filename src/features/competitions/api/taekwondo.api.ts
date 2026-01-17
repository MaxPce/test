// src/features/competitions/api/taekwondo.api.ts

import { apiClient } from "@/lib/api/client";
import type {
  KyoruguiScore,
  PoomsaeScore,
  KyoruguiMatch,
  PoomsaeParticipant,
} from "../types/taekwondo.types";

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

// ✅ ACTUALIZAR ESTA FUNCIÓN
export const updatePoomsaeScore = async (
  participationId: number,
  data: PoomsaeScore,
) => {
  // ✅ Asegurar que sean números
  const payload = {
    accuracy: Number(data.accuracy),
    presentation: Number(data.presentation),
  };

  console.log(
    "🚀 Enviando al backend:",
    payload,
    "Tipos:",
    typeof payload.accuracy,
    typeof payload.presentation,
  ); // DEBUG

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
