import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateShootingScore, setShootingDns } from './shooting.api';

export const useUpdateShootingScore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      participationId,
      data,
    }: {
      participationId: number;
      data: { series: number[] };
    }) => updateShootingScore(participationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shooting-scores'] });
    },
  });
};

export const useSetShootingDns = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (participationId: number) => setShootingDns(participationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shooting-scores'] });
    },
  });
};
