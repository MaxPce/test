import { useMutation, useQueryClient } from '@tanstack/react-query';
import { featuredAthletesApi } from './featured-athletes.api';
import { featuredAthletesKeys } from './featured-athletes.queries';
import type { UpdateFeaturedAthleteData } from '../types';

export const useCreateFeaturedAthlete = (eventCategoryId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: featuredAthletesApi.create,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: featuredAthletesKeys.byCategory(eventCategoryId) }),
  });
};

export const useUpdateFeaturedAthlete = (eventCategoryId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateFeaturedAthleteData }) =>
      featuredAthletesApi.update(id, data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: featuredAthletesKeys.byCategory(eventCategoryId) }),
  });
};

export const useDeleteFeaturedAthlete = (eventCategoryId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: featuredAthletesApi.remove,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: featuredAthletesKeys.byCategory(eventCategoryId) }),
  });
};
