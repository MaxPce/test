// src/features/competitions/api/shooting-phases.mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';

interface GenerateShootingPhasesPayload {
  eventCategoryId: number;
  groups: {
    name: string;
    type: 'grupo' | 'eliminacion';
    registrationIds: number[];
  }[];
}

export function useGenerateShootingPhases() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: GenerateShootingPhasesPayload) => {
      const { data } = await apiClient.post('/shooting/generate-phases', payload);
      return data;
    },
    onSuccess: (_, { eventCategoryId }) => {
      queryClient.invalidateQueries({ queryKey: ['phases', eventCategoryId] });
      toast.success('Fases de tiro deportivo generadas correctamente');
    },
    onError: () => {
      toast.error('Error al generar las fases');
    },
  });
}