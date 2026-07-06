// src/features/competitions/api/weightlifting-phases.mutations.ts 

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { generateWeightliftingPhases } from './weightlifting-phases.api';
import type { GenerateWeightliftingPhasesDto } from './weightlifting-phases.api';

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