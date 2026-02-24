import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  updateWushuScore,
  updateWushuTaoluScore,
  updateWushuTaoluBracketScore,
  updateWushuTaoluMatchScores,
} from './wushu.api';

import type { WushuSandaScore, WushuTaoluScore } from '../types/wushu.types';

// ==================== WUSHU - SANDA (ACTUAL) ====================

export const useUpdateWushuScore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, data }: { matchId: number; data: WushuSandaScore }) =>
      updateWushuScore(matchId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['wushu-match', variables.matchId] });
      queryClient.invalidateQueries({ queryKey: ['wushu-bracket'] });
      toast.success('Puntaje actualizado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar puntaje');
    },
  });
};

// ==================== WUSHU - TAOLU (NUEVO) ====================

// ----- MODO GRUPOS -----

export const useUpdateWushuTaoluScore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      participationId,
      data,
    }: {
      participationId: number;
      data: WushuTaoluScore;
    }) => updateWushuTaoluScore(participationId, data),
    onSuccess: (_, variables) => {
      // Si tu tabla depende del phaseId, invalida con phaseId en queryKey desde el componente.
      queryClient.invalidateQueries({ queryKey: ['wushu-taolu-scores'] });
      queryClient.invalidateQueries({ queryKey: ['wushu-taolu-score', variables.participationId] });
      toast.success('Puntaje guardado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al guardar puntaje');
    },
  });
};

// Helper opcional (si tu modal guarda ambos competidores)
export const useUpdateWushuTaoluMatchScores = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      scores,
    }: {
      scores: Array<{
        participationId: number;
        accuracy: number;
        presentation: number;
      }>;
    }) => updateWushuTaoluMatchScores(scores),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['bracket-structure'] });
      queryClient.invalidateQueries({ queryKey: ['wushu-taolu-scores'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar puntajes');
    },
  });
};

// ----- MODO BRACKET -----

export const useUpdateWushuTaoluBracketScore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      participationId,
      data,
    }: {
      participationId: number;
      data: WushuTaoluScore;
    }) => updateWushuTaoluBracketScore(participationId, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['bracket-structure'] });
      queryClient.invalidateQueries({ queryKey: ['wushu-taolu-bracket-match'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });

      if (result?.matchFinalized) {
        if (result?.advancedToNextRound) {
          toast.success(result.message || '¡Ganador avanzado a la siguiente ronda!');
        } else {
          toast.success(result.message || '¡Match finalizado! Ganador definido.');
        }
      } else {
        toast.success('Puntaje registrado. Esperando al oponente.');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar puntaje');
    },
  });
};
