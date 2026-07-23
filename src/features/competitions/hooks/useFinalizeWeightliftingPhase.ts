import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { weightliftingApi } from '../api/weightlifting.api';

export function useFinalizeWeightliftingPhase(phaseId: number) {
  const queryClient = useQueryClient();

  const finalize = useMutation({
    mutationFn: () => weightliftingApi.finalizePhase(phaseId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["weightlifting", "phase", phaseId, "results"] }); // ← fix
      queryClient.invalidateQueries({ queryKey: ['weightlifting-manual-ranks', phaseId] });
      toast.success(data?.message ?? 'Fase finalizada correctamente'); // ← fix: era data.data
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al finalizar la fase');
    },
  });

  const reopen = useMutation({
    mutationFn: () => weightliftingApi.clearManualRanks(phaseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weightlifting-manual-ranks', phaseId] });
      queryClient.invalidateQueries({ queryKey: ["weightlifting", "phase", phaseId, "results"] }); // ← fix
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