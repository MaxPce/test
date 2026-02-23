import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateWushuScore } from './wushu.api';
import type { WushuSandaScore } from '../types/wushu.types';
import { toast } from 'sonner';

export const useUpdateWushuScore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, data }: { matchId: number; data: WushuSandaScore }) =>
      updateWushuScore(matchId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({
        queryKey: ['wushu-match', variables.matchId],
      });
      queryClient.invalidateQueries({
        queryKey: ['wushu-bracket'],
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
