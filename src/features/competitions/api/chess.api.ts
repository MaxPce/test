import { apiClient } from "@/lib/api/client";
import type {
  ChessRound,
  ChessMatch,
  ChessFullTable,
  ChessStanding,
  ChessParticipant,
  CreateChessRoundDto,
  UpdateChessRoundDto,
  CreateChessMatchDto,
  UpdateChessMatchDto,
} from "../types/chess.types";

// ==================== RONDAS ====================

export const getChessRounds = async (phaseId: number) => {
  const response = await apiClient.get<ChessRound[]>(
    `/competitions/chess/rounds`,
    { params: { phaseId } },
  );
  return response.data;
};

export const createChessRound = async (dto: CreateChessRoundDto) => {
  const response = await apiClient.post<ChessRound>(
    `/competitions/chess/rounds`,
    dto,
  );
  return response.data;
};

export const updateChessRound = async (
  id: number,
  dto: UpdateChessRoundDto,
) => {
  const response = await apiClient.patch<ChessRound>(
    `/competitions/chess/rounds/${id}`,
    dto,
  );
  return response.data;
};

export const deleteChessRound = async (id: number) => {
  const response = await apiClient.delete(
    `/competitions/chess/rounds/${id}`,
  );
  return response.data;
};

// ==================== MATCHES ====================

export const getChessMatchesByRound = async (roundId: number) => {
  const response = await apiClient.get<ChessMatch[]>(
    `/competitions/chess/rounds/${roundId}/matches`,
  );
  return response.data;
};

export const createChessMatch = async (dto: CreateChessMatchDto) => {
  const response = await apiClient.post<ChessMatch>(
    `/competitions/chess/matches`,
    dto,
  );
  return response.data;
};

export const updateChessMatch = async (
  id: number,
  dto: UpdateChessMatchDto,
) => {
  const response = await apiClient.patch<ChessMatch>(
    `/competitions/chess/matches/${id}`,
    dto,
  );
  return response.data;
};

export const deleteChessMatch = async (id: number) => {
  const response = await apiClient.delete(
    `/competitions/chess/matches/${id}`,
  );
  return response.data;
};

// ==================== TABLA COMPLETA ====================

export const getChessFullTable = async (phaseId: number) => {
  const response = await apiClient.get<ChessFullTable[]>(
    `/competitions/phases/${phaseId}/chess-table`,
  );
  return response.data;
};

// ==================== STANDINGS ====================

export const getChessStandings = async (phaseId: number) => {
  const response = await apiClient.get<ChessStanding[]>(
    `/competitions/phases/${phaseId}/chess-standings`,
  );
  return response.data;
};

// ==================== PARTICIPANTES DE LA FASE ====================
// Reutiliza el endpoint genérico de phase-registrations que ya existe en tu backend

export const getChessParticipants = async (phaseId: number) => {
  const response = await apiClient.get<ChessParticipant[]>(
    `/competitions/phases/${phaseId}/registrations`,
  );
  return response.data;
};
