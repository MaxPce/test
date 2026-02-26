import { useQuery } from '@tanstack/react-query';
import { getShootingPhaseScores } from './shooting.api';

export const useShootingPhaseScores = (phaseId: number) => {
  return useQuery({
    queryKey: ['shooting-scores', phaseId],
    queryFn: () => getShootingPhaseScores(phaseId),
    enabled: !!phaseId,
    refetchInterval: 5000,
  });
};
