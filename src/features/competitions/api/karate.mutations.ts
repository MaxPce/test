import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateKarateScore } from './karate.api';
import type { KarateScore } from '../types/karate.types';
import { toast } from 'sonner';

export const useUpdateKarateScore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, data }: { matchId: number; data: KarateScore }) =>
      updateKarateScore(matchId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({
        queryKey: ['karate-match', variables.matchId],
      });
      queryClient.invalidateQueries({
        queryKey: ['karate-bracket'],
      });
      toast.success('Puntaje actualizado correctamente');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Error al actualizar puntaje',
      );
    },
  });
};
