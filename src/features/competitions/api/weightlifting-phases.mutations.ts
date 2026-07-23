// src/features/competitions/api/weightlifting-phases.mutations.ts 

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { generateWeightliftingPhases } from './weightlifting-phases.api';
import type { GenerateWeightliftingPhasesDto } from './weightlifting-phases.api';
import { weightliftingApi } from './weightlifting.api';

export function useGenerateWeightliftingPhases() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GenerateWeightliftingPhasesDto) =>
      generateWeightliftingPhases(data),
    onSuccess: async (_res, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['phases', variables.eventCategoryId],
      });
      toast.success('Fases de pesas generadas correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al generar las fases');
    },
  });
}

export function useFinalizeWeightliftingPhase(phaseId: number) {
  const queryClient = useQueryClient();

  const finalize = useMutation({
    mutationFn: () => weightliftingApi.finalizePhase(phaseId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['weightlifting-results', phaseId] });
      queryClient.invalidateQueries({ queryKey: ['weightlifting-manual-ranks', phaseId] });
      toast.success(data.message ?? 'Fase finalizada correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al finalizar la fase');
    },
  });

  const reopen = useMutation({
    mutationFn: () => weightliftingApi.clearManualRanks(phaseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weightlifting-manual-ranks', phaseId] });
      queryClient.invalidateQueries({ queryKey: ['weightlifting-results', phaseId] });
      toast.success('Fase reabierta correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al reabrir la fase');
    },
  });

  return {
    mutate: finalize.mutate,
    reopen: reopen.mutate,
    isPending: finalize.isPending || reopen.isPending,
  };
}