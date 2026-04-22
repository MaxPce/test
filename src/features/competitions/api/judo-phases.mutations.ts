// src/features/competitions/api/judo-phases.mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  generateKumitePhases,
  type GenerateKumitePhasesDto,
} from './judo-phases.api';

export function useGenerateKumitePhases() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateKumitePhasesDto) =>
      generateKumitePhases(data),
    onSuccess: async (_response, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['phases', variables.eventCategoryId],
      });
      await queryClient.invalidateQueries({ queryKey: ['phases'] });
      toast.success('Fases generadas correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al generar las fases');
    },
  });
}