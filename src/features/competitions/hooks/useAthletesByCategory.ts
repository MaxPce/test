import { useQuery } from '@tanstack/react-query';
import { sismasterApi } from '../../../services/sismasterApi';

export function useAthletesByCategory(
  sismasterEventId: number | null,
  localSportId:     number | null,
  idparam:          number | null,
) {
  return useQuery({
    queryKey: [
      'sismaster', 'athletes-by-category',
      sismasterEventId, localSportId, idparam,
    ],
    queryFn: () =>
      sismasterApi.getAthletesByCategory(
        sismasterEventId!,
        localSportId!,
        idparam!,
      ),
    enabled: !!sismasterEventId && !!localSportId && !!idparam,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
}
