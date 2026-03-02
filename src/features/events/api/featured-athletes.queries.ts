import { useQuery } from '@tanstack/react-query';
import { featuredAthletesApi } from './featured-athletes.api';

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
