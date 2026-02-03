import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateKyoruguiScore,
  updatePoomsaeScore,
  updatePoomsaeBracketScore,
  updatePoomsaeMatchScores,
  updateKyoruguiSingleRound,
  updateKyoruguiRounds,
  deleteKyoruguiRound,
} from "./taekwondo.api";
import type { KyoruguiScore, PoomsaeScore } from "../types/taekwondo.types";
import { toast } from "sonner";

export const useUpdateKyoruguiScore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, data }: { matchId: number; data: KyoruguiScore }) =>
      updateKyoruguiScore(matchId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({
        queryKey: ["kyorugui-match", variables.matchId],
      });
      queryClient.invalidateQueries({
        queryKey: ["kyorugui-bracket"],
      });
      toast.success("Puntaje actualizado correctamente");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Error al actualizar puntaje",
      );
    },
  });
};

// ==================== KYORUGUI - ROUNDS (NUEVO) ====================

/**
 * Actualizar un solo round
 */
export const useUpdateKyoruguiSingleRound = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      matchId,
      data,
    }: {
      matchId: number;
      data: {
        roundNumber: number;
        participant1Points: number;
        participant2Points: number;
      };
    }) => updateKyoruguiSingleRound(matchId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({
        queryKey: ["kyorugui-match", variables.matchId],
      });
      queryClient.invalidateQueries({
        queryKey: ["kyorugui-rounds", variables.matchId],
      });
      queryClient.invalidateQueries({
        queryKey: ["kyorugui-bracket"],
      });
      toast.success(`Round ${variables.data.roundNumber} actualizado`);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Error al actualizar round",
      );
    },
  });
};

/**
 * Actualizar múltiples rounds
 */
export const useUpdateKyoruguiRounds = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      matchId,
      rounds,
    }: {
      matchId: number;
      rounds: Array<{
        roundNumber: number;
        participant1Points: number;
        participant2Points: number;
      }>;
    }) => updateKyoruguiRounds(matchId, rounds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({
        queryKey: ["kyorugui-match", variables.matchId],
      });
      queryClient.invalidateQueries({
        queryKey: ["kyorugui-rounds", variables.matchId],
      });
      queryClient.invalidateQueries({
        queryKey: ["kyorugui-bracket"],
      });
      toast.success("Rounds actualizados correctamente");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Error al actualizar rounds",
      );
    },
  });
};

/**
 * Eliminar un round
 */
export const useDeleteKyoruguiRound = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      matchId,
      roundNumber,
    }: {
      matchId: number;
      roundNumber: number;
    }) => deleteKyoruguiRound(matchId, roundNumber),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({
        queryKey: ["kyorugui-match", variables.matchId],
      });
      queryClient.invalidateQueries({
        queryKey: ["kyorugui-rounds", variables.matchId],
      });
      queryClient.invalidateQueries({
        queryKey: ["kyorugui-bracket"],
      });
      toast.success(`Round ${variables.roundNumber} eliminado`);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Error al eliminar round",
      );
    },
  });
};


// ==================== POOMSAE - MODO GRUPOS ====================

export const useUpdatePoomsaeScore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      participationId,
      data,
    }: {
      participationId: number;
      data: PoomsaeScore;
    }) => updatePoomsaeScore(participationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["poomsae-scores"],
      });
      toast.success("Puntaje guardado correctamente");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al guardar puntaje");
    },
  });
};

export const useUpdatePoomsaeMatchScores = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      matchId,
      scores,
    }: {
      matchId: number;
      scores: Array<{
        participationId: number;
        accuracy: number;
        presentation: number;
      }>;
    }) => updatePoomsaeMatchScores(matchId, scores),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({
        queryKey: ["poomsae-scores"],
      });
      queryClient.invalidateQueries({
        queryKey: ["kyorugui-bracket"],
      });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Error al actualizar puntajes",
      );
    },
  });
};

// ==================== POOMSAE - MODO BRACKET (NUEVO) ====================

export const useUpdatePoomsaeBracketScore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      participationId,
      data,
    }: {
      participationId: number;
      data: PoomsaeScore;
    }) => updatePoomsaeBracketScore(participationId, data),
    onSuccess: (result, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["bracket-structure"] });
      queryClient.invalidateQueries({ queryKey: ["poomsae-bracket-match"] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });

      // Mostrar mensaje según el resultado
      if (result.matchFinalized) {
        if (result.advancedToNextRound) {
          toast.success(
            result.message || "¡Ganador avanzado a la siguiente ronda!",
          );
        } else {
          toast.success(
            result.message || "¡Match finalizado! Ganador definido.",
          );
        }
      } else {
        toast.success("Puntaje registrado. Esperando al oponente.");
      }
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Error al actualizar puntaje",
      );
    },
  });
};
