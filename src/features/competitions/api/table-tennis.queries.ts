import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tableTennisApi } from "./table-tennis.api";
import type { SetLineupDto, UpdateGameDto } from "./table-tennis.api";

// ==================== QUERY KEYS ====================

export const tableTennisKeys = {
  all: ["table-tennis"] as const,
  lineups: (matchId: number) =>
    [...tableTennisKeys.all, "lineups", matchId] as const,
  games: (matchId: number) =>
    [...tableTennisKeys.all, "games", matchId] as const,
  details: (matchId: number) =>
    [...tableTennisKeys.all, "details", matchId] as const,
  result: (matchId: number) =>
    [...tableTennisKeys.all, "result", matchId] as const,
};

// ==================== QUERIES ====================

/**
 * Hook para obtener lineups de un match
 */
export function useMatchLineups(matchId: number) {
  return useQuery({
    queryKey: tableTennisKeys.lineups(matchId),
    queryFn: () => tableTennisApi.getMatchLineups(matchId),
    enabled: matchId > 0,
  });
}

/**
 * Hook para obtener juegos de un match
 */
export function useMatchGames(matchId: number) {
  return useQuery({
    queryKey: tableTennisKeys.games(matchId),
    queryFn: () => tableTennisApi.getMatchGames(matchId),
    enabled: matchId > 0,
  });
}

/**
 * Hook para obtener detalles completos del match
 */
export function useMatchDetails(matchId: number) {
  return useQuery({
    queryKey: tableTennisKeys.details(matchId),
    queryFn: () => tableTennisApi.getMatchDetails(matchId),
    enabled: matchId > 0,
  });
}

/**
 * Hook para obtener resultado del match
 */
export function useMatchResult(matchId: number) {
  return useQuery({
    queryKey: tableTennisKeys.result(matchId),
    queryFn: () => tableTennisApi.getMatchResult(matchId),
    enabled: matchId > 0,
  });
}

// ==================== MUTATIONS ====================

/**
 * Hook para configurar lineup
 */
export function useSetLineup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      participationId,
      data,
    }: {
      participationId: number;
      data: SetLineupDto;
    }) => tableTennisApi.setLineup(participationId, data),
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({
        queryKey: tableTennisKeys.all,
      });
    },
  });
}

/**
 * Hook para generar juegos
 */
export function useGenerateGames() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (matchId: number) => tableTennisApi.generateGames(matchId),
    onSuccess: (_, matchId) => {
      queryClient.invalidateQueries({
        queryKey: tableTennisKeys.games(matchId),
      });
      queryClient.invalidateQueries({
        queryKey: tableTennisKeys.details(matchId),
      });
    },
  });
}

/**
 * Hook para actualizar resultado de un juego
 */
export function useUpdateGameResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ gameId, data }: { gameId: number; data: UpdateGameDto }) =>
      tableTennisApi.updateGameResult(gameId, data),
    onSuccess: (response) => {
      // Invalidar todas las queries del match
      const matchId = response.game?.matchId;
      if (matchId) {
        // Queries específicas de tenis de mesa
        queryClient.invalidateQueries({
          queryKey: tableTennisKeys.games(matchId),
        });
        queryClient.invalidateQueries({
          queryKey: tableTennisKeys.result(matchId),
        });
        queryClient.invalidateQueries({
          queryKey: tableTennisKeys.details(matchId),
        });
        
        queryClient.invalidateQueries({
          queryKey: ['matches', matchId],
        });
        
        queryClient.invalidateQueries({
          queryKey: ['matches'],
        });
        
        queryClient.invalidateQueries({
          queryKey: ['phases'],
        });
      }
    },
  });
}
