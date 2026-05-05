import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  updateWushuScore,
  updateWushuTaoluScore,
  updateWushuTaoluBracketScore,
  updateWushuTaoluMatchScores,
  generateWushuTaoluPhases,
} from './wushu.api';

import type {
  WushuSandaScore,
  WushuTaoluScore,
  WushuTaoluBracketScore,
} from '../types/wushu.types';

// ==================== WUSHU - SANDA ====================

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

// ==================== WUSHU - TAOLU ====================

// ----- MODO GRUPOS (jueces B/A) -----

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
      queryClient.invalidateQueries({ queryKey: ['wushu-taolu-scores'] });
      queryClient.invalidateQueries({ queryKey: ['wushu-taolu-score', variables.participationId] });
      // toast omitido — el componente ya muestra el toast
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al guardar puntaje');
    },
  });
};

// Helper para guardar 2 participaciones a la vez (bracket)
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

// ----- MODO BRACKET (accuracy + presentation) -----

export const useUpdateWushuTaoluBracketScore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      participationId,
      data,
    }: {
      participationId: number;
      data: WushuTaoluBracketScore;
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

export const useGenerateWushuTaoluPhases = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      eventCategoryId: number;
      groups: { name: string; registrationIds: number[] }[];
    }) => {
      console.log('[Taolu mutation] mutationFn called with:', data);
      return generateWushuTaoluPhases(data);
    },
    onSuccess: (res, variables) => {
      console.log('[Taolu mutation] onSuccess:', res);
      queryClient.invalidateQueries({ queryKey: ['phases', variables.eventCategoryId] });
      toast.success('Fases Taolu generadas correctamente');
    },
    onError: (error: any) => {
      console.error('[Taolu mutation] onError:', error?.response?.data ?? error);
      toast.error(error.response?.data?.message || 'Error al generar fases Taolu');
    },
  });
};