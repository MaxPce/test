import { useQuery } from "@tanstack/react-query";
import {
  getKyoruguiMatchDetails,
  getKyoruguiBracket,
  getPoomsaeScoreTable,
  getPoomsaeScore,
  getPoomsaeBracketMatchScores,
  getKyoruguiRounds,
} from "./taekwondo.api";

// ==================== KYORUGUI ====================

export const useKyoruguiMatch = (matchId: number) => {
  return useQuery({
    queryKey: ["kyorugui-match", matchId],
    queryFn: () => getKyoruguiMatchDetails(matchId),
    enabled: !!matchId,
  });
};

export const useKyoruguiBracket = (phaseId: number) => {
  return useQuery({
    queryKey: ["kyorugui-bracket", phaseId],
    queryFn: () => getKyoruguiBracket(phaseId),
    enabled: !!phaseId,
  });
};

// ==================== KYORUGUI - ROUNDS ====================

/**
 * Hook para obtener todos los rounds de un match de Kyorugui
 */
export const useKyoruguiRounds = (matchId: number) => {
  return useQuery({
    queryKey: ["kyorugui-rounds", matchId],
    queryFn: () => getKyoruguiRounds(matchId),
    enabled: !!matchId,
    refetchInterval: 3000,
  });
};


// ==================== POOMSAE - MODO GRUPOS ====================

export const usePoomsaeScoreTable = (phaseId: number) => {
  return useQuery({
    queryKey: ["poomsae-scores", phaseId],
    queryFn: () => getPoomsaeScoreTable(phaseId),
    enabled: !!phaseId,
    refetchInterval: 5000, // Refetch cada 5 segundos para ver actualizaciones
  });
};

export const usePoomsaeScore = (participationId: number) => {
  return useQuery({
    queryKey: ["poomsae-score", participationId],
    queryFn: () => getPoomsaeScore(participationId),
    enabled: !!participationId,
  });
};

// ==================== POOMSAE - MODO BRACKET (NUEVO) ====================

/**
 * Hook para obtener los scores de un match específico en modo bracket
 */
export const usePoomsaeBracketMatchScores = (matchId: number) => {
  return useQuery({
    queryKey: ["poomsae-bracket-match", matchId],
    queryFn: () => getPoomsaeBracketMatchScores(matchId),
    enabled: !!matchId,
    refetchInterval: 3000,
  });
};
