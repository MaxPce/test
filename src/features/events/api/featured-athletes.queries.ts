import { useQuery } from '@tanstack/react-query';
import { featuredAthletesApi } from './featured-athletes.api';
import type { FeaturedAthlete } from '../types';

export const featuredAthletesKeys = {
  byCategory: (eventCategoryId: number) =>
    ['featured-athletes', 'event-category', eventCategoryId] as const,
};

export const useFeaturedAthletesByCategory = (eventCategoryId: number) => {
  return useQuery({
    queryKey: featuredAthletesKeys.byCategory(eventCategoryId),
    queryFn: () => featuredAthletesApi.getByEventCategory(eventCategoryId),
    enabled: !!eventCategoryId,
  });
};

export function useFeaturedAthletesByPhase(phaseId: number | null) {
  return useQuery<FeaturedAthlete[]>({
    queryKey: ['featured-athletes', 'phase', phaseId],
    queryFn: () => featuredAthletesApi.getByPhase(phaseId!),
    enabled: phaseId !== null && phaseId > 0,
  });
}

