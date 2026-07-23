import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export function useFinalizeWeightliftingPhase(phaseId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient.post(`/competitions/weightlifting/phases/${phaseId}/finalize`),
    onSuccess: () => {
      // Invalidar resultados para que MedalleroPanel se actualice
      queryClient.invalidateQueries({
        queryKey: ['weightlifting-phase-results', phaseId],
      });
    },
  });
}