import { useQuery } from '@tanstack/react-query';
import { sismasterApi } from '../../../services/sismasterApi';

export function useSportCategories(
  localSportId:     number | null,
  sismasterEventId: number | null,
) {
  return useQuery({
    queryKey: ['sismaster', 'sport-params', localSportId, sismasterEventId],
    queryFn: () =>
      sismasterApi.getSportParamsByLocalSport(localSportId!, sismasterEventId!),
    enabled: !!localSportId && !!sismasterEventId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}
