import { useQuery } from '@tanstack/react-query';
import { sismasterApi } from '../../../services/sismasterApi';
import { haymasterApi } from '../../../services/haymasterApi';

export function useAthletesByCategory(
  sismasterEventId: number | null,
  localSportId:     number | null,
  idparam:          number | null,
  source:           'sismaster' | 'haymaster' = 'sismaster',  // ← nuevo parámetro
) {
  const api = source === 'haymaster' ? haymasterApi : sismasterApi;

  return useQuery({
    queryKey: [
      source, 'athletes-by-category',
      sismasterEventId, localSportId, idparam,
    ],
    queryFn: () =>
      api.getAthletesByCategory(
        sismasterEventId!,
        localSportId!,
        idparam!,
      ),
    enabled: !!sismasterEventId && !!localSportId && !!idparam,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
}