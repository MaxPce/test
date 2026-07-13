// src/features/competitions/api/taekwondo-poomsae-phases.mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  generatePoomsaePhases,
  type GeneratePoomsaePhasesDto,
} from './taekwondo-poomsae-phases.api';

export function useGeneratePoomsaePhases() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GeneratePoomsaePhasesDto) =>
      generatePoomsaePhases(data),
    onSuccess: async (_response, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['phases', variables.eventCategoryId],
      });
      await queryClient.invalidateQueries({ queryKey: ['phases'] });
      toast.success('Fases de Poomsae generadas correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al generar las fases de Poomsae');
    },
  });
}