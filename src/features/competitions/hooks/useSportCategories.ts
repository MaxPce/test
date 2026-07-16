import { useQuery } from '@tanstack/react-query';
import { sismasterApi } from '../../../services/sismasterApi';
import { haymasterApi } from '../../../services/haymasterApi';

export function useSportCategories(
  localSportId:     number | null,
  sismasterEventId: number | null,
  source:           'sismaster' | 'haymaster' = 'sismaster', 
) {
  const api = source === 'haymaster' ? haymasterApi : sismasterApi;

  return useQuery({
    queryKey: [source, 'sport-params', localSportId, sismasterEventId],
    queryFn: () =>
      api.getSportParamsByLocalSport(localSportId!, sismasterEventId!),
    enabled: !!localSportId && !!sismasterEventId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}