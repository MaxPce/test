import { useMutation, useQueryClient } from '@tanstack/react-query';
import { featuredAthletesApi } from './featured-athletes.api';
import { featuredAthletesKeys } from './featured-athletes.queries';
import type { UpdateFeaturedAthleteData } from '../types';
import type { UpsertFeaturedAthleteByPhasePayload } from '../types';

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

export function useUpsertFeaturedAthleteByPhase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpsertFeaturedAthleteByPhasePayload) =>
      featuredAthletesApi.upsertByPhase(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['featured-athletes', 'phase', variables.phaseId],
      });
    },
  });
}

export function useDeleteFeaturedAthleteByPhase(phaseId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (featuredAthleteId: number) =>
      featuredAthletesApi.remove(featuredAthleteId), 
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['featured-athletes', 'phase', phaseId],
      });
    },
  });
}
