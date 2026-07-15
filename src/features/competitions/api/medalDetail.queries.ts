// src/features/competitions/api/medalDetail.queries.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export interface MedalDetailRow {
  registrationId: number;
  athleteName: string;
  categoryName: string;
  phaseName: string;
  position: number;
  medalType: 'gold' | 'silver' | 'bronze' | 'fifth' | 'seventh';
}

export interface MedalDetailResponse {
  institutionId: number;
  institutionName: string;
  athletes: MedalDetailRow[];
}

export function useMedalDetail(
  endpoint: string | undefined,
  externalEventId: number | undefined,
  localSportId: number | undefined,
  institutionId: number | undefined,
) {
  return useQuery<MedalDetailRow[]>({
    queryKey: ['medal-detail', endpoint, externalEventId, localSportId, institutionId],
    queryFn: async () => {
      const { data } = await apiClient.get<MedalDetailResponse>(
        `/${endpoint}/external/${externalEventId}/local-sport/${localSportId}/institution/${institutionId}/detail`,
      );
      return data.athletes;
    },
    enabled: !!endpoint && !!externalEventId && !!localSportId && !!institutionId,
  });
}